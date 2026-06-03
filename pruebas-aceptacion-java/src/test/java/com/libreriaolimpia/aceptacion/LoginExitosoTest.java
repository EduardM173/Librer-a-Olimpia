package com.libreriaolimpia.aceptacion;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import io.github.bonigarcia.wdm.WebDriverManager;

/****************************************/
// HISTORIA DE USUARIO: Como usuario quiero iniciar sesión para acceder a mi cuenta.
//
// PRUEBA DE ACEPTACIÓN: loginExitoso() - Usuario válido inicia sesión.
//
// Paso 1. Abrir página principal y desplegar modal de login.
// Paso 2. Ingresar email y contraseña válidos.
// Paso 3. Hacer clic en iniciar sesión.
//
// Resultado Esperado: El usuario accede al sistema, aparece su nombre en el navbar y el token se guarda en localStorage.
/****************************************/

public class LoginExitosoTest {

    private WebDriver driver;
    private static final String BASE_URL = "http://localhost:5173";

    @BeforeTest
    public void setUp() throws Exception {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }

    @AfterTest
    public void tearDown() throws Exception {
        Thread.sleep(5000);
        if (driver != null) {
            driver.quit();
        }
    }

    /**
     * Método robusto para escribir en un input que no responde a sendKeys normal.
     * Estrategia: Actions (click + sendKeys) -> si falla, usa JavaScript.
     */
    private void escribirEnInputRobusto(WebDriver driver, WebDriverWait wait, String xpath, String texto) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));

        // Estrategia 1: Scroll + click con Actions + sendKeys
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", input);

        Actions actions = new Actions(driver);
        actions.moveToElement(input).click().pause(Duration.ofMillis(200)).sendKeys(texto).perform();

        // Verificar si se escribió
        String valorActual = input.getAttribute("value");
        if (valorActual == null || !valorActual.equals(texto)) {
            // Estrategia 2: Limpiar y reintentar con sendKeys directo
            input.clear();
            input.click();
            input.sendKeys(texto);

            valorActual = input.getAttribute("value");
            if (valorActual == null || !valorActual.equals(texto)) {
                // Estrategia 3: JavaScript (garantizado)
                ((JavascriptExecutor) driver).executeScript(
                    "arguments[0].value = arguments[1]; " +
                    "arguments[0].dispatchEvent(new Event('input', { bubbles: true })); " +
                    "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
                    input, texto);
            }
        }
    }

    @Test
    public void loginExitoso() {

        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Abrir modal de login.");
        WebElement btnLogin = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Iniciar sesión' or normalize-space()='Login' or contains(text(),'Iniciar')]")));
        btnLogin.click();

        System.out.println("Paso 2: Esperar que el modal esté visible.");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//div[contains(@class,'modal') or contains(@class,'dialog') or contains(@role,'dialog')]")));

        // Pequeña pausa para que React/Vue monte el DOM del modal
        try { Thread.sleep(500); } catch (InterruptedException e) { }

        System.out.println("Paso 3: Ingresar email.");
        escribirEnInputRobusto(driver, wait,
            "//div[contains(@class,'modal') or contains(@class,'dialog')]//input[@type='email' or @name='email' or contains(@placeholder,'correo') or contains(@placeholder,'email')]",
            "admin@olimpia.com");

        System.out.println("Paso 4: Ingresar contraseña.");
        escribirEnInputRobusto(driver, wait,
            "//div[contains(@class,'modal') or contains(@class,'dialog')]//input[@type='password' or @name='password' or contains(@placeholder,'contraseña') or contains(@placeholder,'password')]",
            "admin123");

        System.out.println("Paso 5: Enviar formulario.");
        WebElement btnSubmit = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//div[contains(@class,'modal') or contains(@class,'dialog')]//button[@type='submit' or contains(text(),'Iniciar') or contains(text(),'Login') or contains(text(),'Entrar') or contains(text(),'Acceder')]")));
        btnSubmit.click();

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        System.out.println("Paso 6: Verificar token en localStorage.");
        wait.until(driver -> {
            Object token = ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('auth_token');");
            return token != null && !token.toString().isBlank();
        });

        System.out.println("Paso 7: Verificar nombre de usuario en navbar.");
        WebElement userName = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//span[contains(@class,'navbar-user-name') or contains(text(),'admin') or contains(text(),'prueba')]")));

        Assert.assertTrue(userName.isDisplayed(),
            "Debe mostrar el nombre del usuario logueado en el navbar.");

        Assert.assertTrue(
            ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('auth_token');") != null,
            "El token debe quedar guardado en localStorage.");

        System.out.println("✅ PRUEBA PASADA: loginExitoso() - Usuario válido inicia sesión.");
    }
}
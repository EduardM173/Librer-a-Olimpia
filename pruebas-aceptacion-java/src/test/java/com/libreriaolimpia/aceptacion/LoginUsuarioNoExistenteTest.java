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
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import io.github.bonigarcia.wdm.WebDriverManager;

/****************************************/
// HISTORIA DE USUARIO: Como usuario quiero iniciar sesion en el sistema.
//
// PRUEBA DE ACEPTACION: loginUsuarioNoExistente() - Error con usuario no registrado.
//
// Paso 1. Abrir modal de login.
// Paso 2. Ingresar email que no existe.
// Paso 3. Enviar formulario.
//
// Resultado Esperado: El sistema muestra mensaje de error de usuario no encontrado.
/****************************************/

public class LoginUsuarioNoExistenteTest {

    private WebDriver driver;
    private static final String BASE_URL = "http://localhost:5173";

    @BeforeMethod
    public void setUp() throws Exception {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() throws Exception {
        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception e) {
                System.out.println("Error al cerrar driver: " + e.getMessage());
            }
        }
    }

    private void escribirEnInputRobusto(WebDriver driver, WebDriverWait wait, String xpath, String texto) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", input);

        Actions actions = new Actions(driver);
        actions.moveToElement(input).click().pause(Duration.ofMillis(200)).sendKeys(texto).perform();

        String valorActual = input.getAttribute("value");
        if (valorActual == null || !valorActual.equals(texto)) {
            input.clear();
            input.click();
            input.sendKeys(texto);

            valorActual = input.getAttribute("value");
            if (valorActual == null || !valorActual.equals(texto)) {
                ((JavascriptExecutor) driver).executeScript(
                    "arguments[0].value = arguments[1]; " +
                    "arguments[0].dispatchEvent(new Event('input', { bubbles: true })); " +
                    "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
                    input, texto);
            }
        }
    }

    @Test
    public void loginUsuarioNoExistente() {

        driver.get(BASE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        System.out.println("Paso 1: Abrir modal de login.");
        WebElement btnLogin = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Iniciar sesion' or normalize-space()='Login' or contains(text(),'Iniciar')]")));
        btnLogin.click();

        System.out.println("Paso 2: Esperar modal.");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//div[contains(@class,'modal') or contains(@class,'dialog') or contains(@role,'dialog')]")));

        try { Thread.sleep(300); } catch (InterruptedException e) { }

        System.out.println("Paso 3: Ingresar credenciales.");
        escribirEnInputRobusto(driver, wait,
            "//div[contains(@class,'modal') or contains(@class,'dialog')]//input[@type='email' or @name='email' or contains(@placeholder,'correo') or contains(@placeholder,'email')]",
            "noexiste@test.com");

        escribirEnInputRobusto(driver, wait,
            "//div[contains(@class,'modal') or contains(@class,'dialog')]//input[@type='password' or @name='password' or contains(@placeholder,'contrasena') or contains(@placeholder,'password')]",
            "cualquier123");

        System.out.println("Paso 4: Enviar formulario.");
        WebElement btnSubmit = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//div[contains(@class,'modal') or contains(@class,'dialog')]//button[@type='submit' or contains(text(),'Iniciar') or contains(text(),'Login') or contains(text(),'Entrar') or contains(text(),'Acceder')]")));
        btnSubmit.click();

        System.out.println("Paso 5: Esperando respuesta del servidor (puede tardar)...");

        // El backend tarda mucho, esperamos hasta 60 segundos a que aparezca el mensaje
        // PERO usamos una espera inteligente que verifica cada 500ms
        WebElement mensajeError = null;
        long inicio = System.currentTimeMillis();
        long tiempoMaximo = 60000; // 60 segundos maximo

        while (mensajeError == null && (System.currentTimeMillis() - inicio) < tiempoMaximo) {
            try {
                // Buscar con JavaScript: recorre todo el DOM incluyendo shadow DOM y portals
                String script = 
                    "function buscarTexto(root, texto) {" +
                    "  var todos = root.querySelectorAll('*');" +
                    "  for (var i = 0; i < todos.length; i++) {" +
                    "    var t = (todos[i].innerText || todos[i].textContent || '').toLowerCase();" +
                    "    if (t.indexOf(texto) !== -1 && todos[i].offsetParent !== null) return todos[i];" +
                    "  }" +
                    "  return null;" +
                    "}" +
                    "return buscarTexto(document, 'credenciales');";

                Object resultado = ((JavascriptExecutor) driver).executeScript(script);
                if (resultado instanceof WebElement) {
                    mensajeError = (WebElement) resultado;
                    break;
                }
            } catch (Exception e) {
                // ignorar errores transitorios
            }

            // Esperar 500ms antes de reintentar
            try { Thread.sleep(500); } catch (InterruptedException e) { }
        }

        // Si no encontro con "credenciales", probar con "error"
        if (mensajeError == null) {
            String script = 
                "function buscarTexto(root, texto) {" +
                "  var todos = root.querySelectorAll('*');" +
                "  for (var i = 0; i < todos.length; i++) {" +
                "    var t = (todos[i].innerText || todos[i].textContent || '').toLowerCase();" +
                "    if (t.indexOf(texto) !== -1 && todos[i].offsetParent !== null) return todos[i];" +
                "  }" +
                "  return null;" +
                "}" +
                "return buscarTexto(document, 'error');";

            Object resultado = ((JavascriptExecutor) driver).executeScript(script);
            if (resultado instanceof WebElement) {
                mensajeError = (WebElement) resultado;
            }
        }

        Assert.assertNotNull(mensajeError, 
            "No se encontro mensaje de error despues de esperar 60 segundos. El servidor puede estar muy lento.");
        Assert.assertTrue(mensajeError.isDisplayed(),
            "El mensaje de error debe estar visible.");

        System.out.println("PRUEBA PASADA: loginUsuarioNoExistente()");
        System.out.println("   Mensaje encontrado: " + mensajeError.getText());
    }
}
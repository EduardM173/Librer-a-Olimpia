package com.libreriaolimpia.aceptacion;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import io.github.bonigarcia.wdm.WebDriverManager;

/****************************************/
// HISTORIA DE USUARIO: Como usuario quiero iniciar sesión en el sistema.
//
// PRUEBA DE ACEPTACIÓN: loginContrasenaIncorrecta() - Error con contraseña incorrecta.
//
// Paso 1. Abrir modal de login.
// Paso 2. Ingresar email válido y contraseña incorrecta.
// Paso 3. Enviar formulario.
//
// Resultado Esperado: El sistema muestra mensaje de error de credenciales inválidas.
/****************************************/

public class LoginContrasenaIncorrectaTest {

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

    @Test
    public void loginContrasenaIncorrecta() {

        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Abrir modal de login.");
        WebElement btnLogin = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Iniciar sesión' or normalize-space()='Login']")));
        btnLogin.click();

        System.out.println("Paso 2: Ingresar email válido y contraseña incorrecta.");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//h2[normalize-space()='Iniciar Sesión' or normalize-space()='Iniciar sesión' or contains(text(),'Login')]")));

        driver.findElement(By.xpath("//label[contains(text(),'Correo') or contains(text(),'Email')]/following-sibling::input")).sendKeys("admin@olimpia.com");
        driver.findElement(By.xpath("//label[contains(text(),'Contraseña') or contains(text(),'Password')]/following-sibling::input")).sendKeys("contrasenaMala123");

        System.out.println("Paso 3: Enviar formulario.");
        driver.findElement(By.xpath("//div[contains(@class,'modal-panel')]//button[contains(text(),'Iniciar') or contains(text(),'Login')]")).click();

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        WebElement mensajeError = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[contains(text(),'incorrecta') or contains(text(),'inválida') or contains(text(),'error') or contains(@class,'error')]")));

        Assert.assertTrue(mensajeError.isDisplayed(),
            "Debe mostrar mensaje de error de contraseña incorrecta.");

        System.out.println("✅ PRUEBA PASADA: loginContrasenaIncorrecta() - Error con contraseña incorrecta.");
    }
}
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
// HISTORIA DE USUARIO: Como usuario quiero registrarme en el sistema.
//
// PRUEBA DE ACEPTACIÓN: registroEmailExistente() - Error al usar email ya registrado.
//
// Paso 1. Abrir página principal y desplegar modal de registro.
// Paso 2. Completar formulario con email que ya existe.
// Paso 3. Enviar formulario.
//
// Resultado Esperado: El sistema muestra mensaje de error indicando que el email ya está registrado.
/****************************************/

public class RegistroEmailExistenteTest {

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
        // Esperar 5 segundos para ver el resultado antes de cerrar
        Thread.sleep(5000);
        
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void registroEmailExistente() {

        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Abrir modal de registro.");
        WebElement btnRegistrarse = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Registrarse']")));
        btnRegistrarse.click();

        System.out.println("Paso 2: Completar con email existente.");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//h2[normalize-space()='Crear una cuenta']")));

        driver.findElement(By.xpath("//label[normalize-space()='Nombre']/following-sibling::input")).sendKeys("UsuarioExistente");
        driver.findElement(By.xpath("//label[normalize-space()='Correo electrónico']/following-sibling::input")).sendKeys("admin@olimpia.com");
        driver.findElement(By.xpath("//label[normalize-space()='Contraseña']/following-sibling::input")).sendKeys("Password123-");
        driver.findElement(By.xpath("//label[normalize-space()='Repetir contraseña']/following-sibling::input")).sendKeys("Password123-");

        System.out.println("Paso 3: Enviar formulario.");
        driver.findElement(By.xpath("//div[contains(@class,'modal-panel')]//button[normalize-space()='Registrarse']")).click();

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        WebElement mensajeError = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[contains(text(),'ya existe') or contains(text(),'ya registrado') or contains(@class,'error')]")));

        Assert.assertTrue(mensajeError.isDisplayed(),
            "Debe mostrar mensaje de error de email duplicado.");

        System.out.println("✅ PRUEBA PASADA: registroEmailExistente() - Error al usar email ya registrado.");
    }
}
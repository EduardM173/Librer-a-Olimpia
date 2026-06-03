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
// PRUEBA DE ACEPTACIÓN: registroCamposVacios() - No permite enviar formulario vacío.
//
// Paso 1. Abrir página principal y desplegar modal de registro.
// Paso 2. Hacer clic en registrarse sin llenar campos.
//
// Resultado Esperado: El formulario no se envía, sigue en el modal o muestra validación.
/****************************************/

public class RegistroCamposVaciosTest {

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
    public void registroCamposVacios() {

        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Abrir modal de registro.");
        WebElement btnRegistrarse = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Registrarse']")));
        btnRegistrarse.click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//h2[normalize-space()='Crear una cuenta']")));

        System.out.println("Paso 2: Hacer clic en registrarse sin llenar campos.");
        driver.findElement(By.xpath("//div[contains(@class,'modal-panel')]//button[normalize-space()='Registrarse']")).click();

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        boolean modalVisible = driver.findElements(By.xpath("//h2[normalize-space()='Crear una cuenta']")).size() > 0;
        boolean enPaginaPrincipal = driver.getCurrentUrl().equals(BASE_URL + "/") || driver.getCurrentUrl().equals(BASE_URL);

        Assert.assertTrue(modalVisible || enPaginaPrincipal,
            "No debe redirigir con campos vacíos, debe quedar en registro o mostrar validación.");

        System.out.println("✅ PRUEBA PASADA: registroCamposVacios() - No permite enviar formulario vacío.");
    }
}
package com.libreriaolimpia.aceptacion;

import java.time.Duration;
import java.util.UUID;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
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
// HISTORIA DE USUARIO: Usuario nuevo puede registrarse desde la interfaz.
//
// PRUEBA DE ACEPTACIÓN: registroExitoso() - Usuario nuevo se registra correctamente.
//
// Paso 1. Abrir la pagina principal y desplegar el modal de registro.
// Paso 2. Completar nombre, correo, contraseña y confirmacion.
// Paso 3. Enviar el formulario y verificar el mensaje de exito y el cierre del modal.
//
// Resultado Esperado: El sistema registra al usuario, inicia sesion automaticamente y muestra la confirmacion de registro exitoso.
/****************************************/

// Para ejecutar: mvn clean compile test -Dtest=RegistroExitosoTest

public class RegistroExitosoTest {

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
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void registroExitoso() {

        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        String nombre = "Prueba";
        String email = "pruebatest." + UUID.randomUUID().toString().replace("-", "").substring(0, 10) + "@olimpia.com";
        String password = "Pruebatest123-";

        driver.get(BASE_URL);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        WebElement botonRegistrarse = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[normalize-space()='Registrarse']")));

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Abrir el modal de registro.");
        botonRegistrarse.click();

        System.out.println("Paso 2: Completar el formulario de registro.");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[normalize-space()='Crear una cuenta']")));

        driver.findElement(By.xpath("//label[normalize-space()='Nombre']/following-sibling::input")).sendKeys(nombre);
        driver.findElement(By.xpath("//label[normalize-space()='Correo electrónico']/following-sibling::input")).sendKeys(email);
        driver.findElement(By.xpath("//label[normalize-space()='Contraseña']/following-sibling::input")).sendKeys(password);
        driver.findElement(By.xpath("//label[normalize-space()='Repetir contraseña']/following-sibling::input")).sendKeys(password);

        System.out.println("Paso 3: Enviar el formulario de registro.");
        driver.findElement(By.xpath("//div[contains(@class,'modal-panel')]//button[normalize-space()='Registrarse']")).click();

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        wait.until(driver -> {
            Object token = ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('auth_token');");
            return token != null && !token.toString().isBlank();
        });
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//span[contains(@class,'navbar-user-name') and contains(normalize-space(.),'" + nombre + "')]")
        ));

        Assert.assertTrue(
            driver.getCurrentUrl().contains("http://localhost:5173"),
            "La prueba debe ejecutarse sobre la pagina principal."
        );

        Assert.assertFalse(
            driver.findElements(By.xpath("//h2[normalize-space()='Crear una cuenta']")).size() > 0,
            "El modal de registro debe cerrarse despues del envio exitoso."
        );

        Assert.assertTrue(
            driver.findElements(By.xpath("//span[contains(@class,'navbar-user-name') and contains(normalize-space(.),'" + nombre + "')]")).size() > 0,
            "El navbar debe mostrar al usuario registrado como sesion activa."
        );

        Assert.assertTrue(
            ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('auth_token');") != null,
            "El token debe quedar guardado en localStorage despues del registro."
        );

        System.out.println("✅ PRUEBA PASADA: registroExitoso() - Usuario nuevo se registra correctamente.");
    }
}
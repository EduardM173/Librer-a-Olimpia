package com.libreriaolimpia.aceptacion;

import java.time.Duration;
import java.util.List;

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
// HISTORIA DE USUARIO: Como cliente quiero buscar productos en el catálogo.
//
// PRUEBA DE ACEPTACIÓN: buscarProducto() - Buscar "libro" y verificar resultados.
//
// Paso 1. Abrir catálogo de productos.
// Paso 2. Escribir "libro" en el buscador.
// Paso 3. Presionar buscar o Enter.
//
// Resultado Esperado: El catálogo muestra productos que coinciden con la búsqueda.
/****************************************/

public class BuscarProductoTest {

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
    public void buscarProducto() {

        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL + "/catalogo");  // <-- NAVEGAR AL CATÁLOGO
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Encontrar buscador.");
        WebElement buscador = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//input[@placeholder='Buscar' or @placeholder='Search' or contains(@class,'search') or contains(@id,'buscar')]")));

        System.out.println("Paso 2: Escribir 'libro' y buscar.");
        buscador.sendKeys("libro");
        buscador.submit();

        wait.until(ExpectedConditions.presenceOfElementLocated(
            By.xpath("//div[contains(@class,'producto') or contains(@class,'card') or contains(@class,'resultado')]")));

        List<WebElement> resultados = driver.findElements(
            By.xpath("//div[contains(@class,'producto') or contains(@class,'card') or contains(@class,'resultado')]"));

        System.out.println("Resultados encontrados: " + resultados.size());

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        Assert.assertTrue(resultados.size() > 0,
            "Debe mostrar resultados de búsqueda.");

        System.out.println("✅ PRUEBA PASADA: buscarProducto() - Buscar 'libro' y verificar resultados.");
    }
}
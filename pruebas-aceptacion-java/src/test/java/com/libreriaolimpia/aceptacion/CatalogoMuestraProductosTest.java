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
// HISTORIA DE USUARIO: Como cliente quiero ver el catálogo de productos.
//
// PRUEBA DE ACEPTACIÓN: catalogoMuestraProductos() - El catálogo muestra al menos 1 producto.
//
// Paso 1. Abrir página del catálogo: http://localhost:5173/catalogo
// Paso 2. Verificar que hay productos cargados.
//
// Resultado Esperado: El catálogo muestra al menos 1 producto.
/****************************************/

public class CatalogoMuestraProductosTest {

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
    public void catalogoMuestraProductos() {

        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL + "/catalogo");  // <-- NAVEGAR AL CATÁLOGO
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Abrir catálogo de productos.");
        
        // Esperar a que carguen los productos
        wait.until(ExpectedConditions.presenceOfElementLocated(
            By.xpath("//div[contains(@class,'producto') or contains(@class,'card') or contains(@class,'item') or contains(@class,'product')]")));

        List<WebElement> productos = driver.findElements(
            By.xpath("//div[contains(@class,'producto') or contains(@class,'card') or contains(@class,'item') or contains(@class,'product')]"));

        System.out.println("Productos encontrados: " + productos.size());

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        Assert.assertTrue(productos.size() > 0,
            "El catálogo debe mostrar al menos 1 producto.");

        System.out.println("✅ PRUEBA PASADA: catalogoMuestraProductos() - El catálogo muestra al menos 1 producto.");
    }
}
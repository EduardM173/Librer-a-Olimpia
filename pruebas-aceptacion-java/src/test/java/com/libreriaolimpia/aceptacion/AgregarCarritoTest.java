package com.libreriaolimpia.aceptacion;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import io.github.bonigarcia.wdm.WebDriverManager;

/****************************************/
// HISTORIA DE USUARIO: Como cliente quiero agregar productos al carrito.
//
// PRUEBA DE ACEPTACION: agregarCarrito() - El sistema permite agregar un producto al carrito desde el catálogo.
//
// Paso 1. Abrir página del catálogo.
// Paso 2. Hacer clic en "Agregar al carrito" en el primer producto disponible.
// Paso 3. Verificar que el contador del carrito se incrementa.
//
// Resultado Esperado: El producto se agrega y el icono del carrito muestra la cantidad actualizada.
/****************************************/

public class AgregarCarritoTest {

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
        try { Thread.sleep(10000); } catch (Exception e) {} // Esperar 10s para ver el resultado final
        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception e) {
                System.out.println("Error al cerrar driver: " + e.getMessage());
            }
        }
    }

    @Test
    public void agregarCarrito() {
        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL + "/catalogo");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try { Thread.sleep(2000); } catch (Exception e) {}

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Abrir catálogo de productos.");
        wait.until(ExpectedConditions.presenceOfElementLocated(
            By.xpath("//div[contains(@class,'product-card') or contains(@class,'producto')]")));

        System.out.println("Paso 2: Hacer clic en 'Agregar al carrito'.");
        WebElement btnAgregar = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("(//button[contains(@class,'add-to-cart-btn') or contains(text(),'Agregar')])[1]")));
        btnAgregar.click();
        try { Thread.sleep(2000); } catch (Exception e) {}

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        System.out.println("Paso 3: Verificar que el contador del carrito se incrementa.");
        WebElement cartCount = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//span[contains(@class,'cart-count')]")));

        Assert.assertTrue(cartCount.isDisplayed(), "El contador del carrito debe ser visible tras agregar un producto.");
        Assert.assertEquals(cartCount.getText(), "1", "El contador del carrito debe ser 1.");

        System.out.println("✅ PRUEBA PASADA: agregarCarrito() - Producto agregado correctamente.");
    }
}

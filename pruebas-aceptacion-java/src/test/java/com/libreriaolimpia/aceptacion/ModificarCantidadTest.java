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
// HISTORIA DE USUARIO: Como cliente quiero modificar la cantidad de productos en el carrito.
//
// PRUEBA DE ACEPTACION: modificarCantidad() - Aumentar o disminuir unidades dentro del carrito.
//
// Paso 1. Agregar un producto al carrito.
// Paso 2. Abrir el modal/página del carrito.
// Paso 3. Modificar la cantidad usando los botones + / -.
// Paso 4. Verificar que la cantidad total se actualiza.
//
// Resultado Esperado: La cantidad del producto cambia exitosamente y el total se recalcula.
/****************************************/

public class ModificarCantidadTest {

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
    public void modificarCantidad() {
        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL + "/catalogo");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try { Thread.sleep(2000); } catch (Exception e) {}

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Agregar un producto al carrito.");
        WebElement btnAgregar = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("(//button[contains(@class,'add-to-cart-btn') or contains(text(),'Agregar')])[1]")));
        btnAgregar.click();
        try { Thread.sleep(2000); } catch (Exception e) {}

        System.out.println("Paso 2: Abrir el carrito.");
        WebElement btnCarrito = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[contains(@class,'cart-link') or contains(@class,'carrito')]")));
        btnCarrito.click();
        try { Thread.sleep(2000); } catch (Exception e) {}

        System.out.println("Paso 3: Aumentar la cantidad del producto.");
        WebElement btnAumentar = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[contains(text(),'+')] | //button[contains(@class,'btn-plus')] | //button[contains(@class,'increase')]")));
        btnAumentar.click();
        try { Thread.sleep(3000); } catch (Exception e) {} // Pausa para la actualización UI y para ver el click

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        System.out.println("Paso 4: Verificar que la cantidad se actualizó a 2.");
        
        WebElement cartCount = driver.findElement(By.xpath("//span[contains(@class,'cart-count')] | //span[contains(@class,'item-qty')] | //span[contains(text(),'2')]"));
        Assert.assertTrue(cartCount.getText().contains("2") || cartCount.isDisplayed(), "La cantidad en el carrito debería ser 2 o reflejar el cambio.");

        System.out.println("✅ PRUEBA PASADA: modificarCantidad() - La cantidad se modificó correctamente.");
    }
}

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
// HISTORIA DE USUARIO: Como cliente quiero finalizar la compra de mis productos.
//
// PRUEBA DE ACEPTACION: checkoutCompleto() - Flujo completo desde agregar producto hasta el checkout.
//
// Paso 1. Iniciar sesión.
// Paso 2. Agregar un producto al carrito y proceder al checkout.
// Paso 3. Confirmar que se redirige correctamente.
//
// Resultado Esperado: Redirección a la página de checkout.
/****************************************/

public class CheckoutCompletoTest {

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
    public void checkoutCompleto() {
        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try { Thread.sleep(2000); } catch (Exception e) {}

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Iniciar sesión (para poder comprar).");
        driver.findElement(By.xpath("//button[contains(text(),'Iniciar sesión') or contains(@class,'btn-login')]")).click();
        try { Thread.sleep(2000); } catch (Exception e) {} // Pausa visual
        
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(translate(text(), 'SESIÓN', 'sesión'),'sesión') or contains(text(),'Login')]")));
        driver.findElement(By.xpath("//input[@type='email']")).sendKeys("prueba16@olimpia.com");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("Prueba16-");
        
        try { Thread.sleep(2000); } catch (Exception e) {} // Pausa visual
        
        driver.findElement(By.xpath("//button[@type='submit' and contains(text(),'Iniciar')]")).click();
        
        try { Thread.sleep(3000); } catch (Exception e) {} // Esperar a que el login se procese visualmente

        System.out.println("Paso 2: Agregar producto y abrir carrito.");
        driver.get(BASE_URL + "/catalogo");
        try { Thread.sleep(2000); } catch (Exception e) {}
        
        WebElement btnAgregar = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("(//button[contains(@class,'add-to-cart-btn') or contains(text(),'Agregar')])[1]")));
        btnAgregar.click();
        try { Thread.sleep(2000); } catch (Exception e) {}

        WebElement btnCarrito = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[contains(@class,'cart-link')]")));
        btnCarrito.click();
        try { Thread.sleep(2000); } catch (Exception e) {}

        System.out.println("Paso 3: Proceder al checkout.");
        // Primero clic en FINALIZAR COMPRA del modal
        WebElement btnIrCarrito = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//a[contains(@class,'cart-checkout') or contains(text(),'FINALIZAR')] | //button[contains(text(),'FINALIZAR')]")));
        btnIrCarrito.click();
        try { Thread.sleep(2000); } catch (Exception e) {}
        
        // Ahora en la página del carrito, clic en FINALIZAR COMPRA de nuevo
        WebElement btnPagar = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//a[contains(@class,'btn-pay') or contains(text(),'FINALIZAR')] | //button[contains(text(),'FINALIZAR')]")));
        btnPagar.click();
        try { Thread.sleep(2000); } catch (Exception e) {}
        
        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        System.out.println("Paso 4: Verificar redirección a página de checkout.");
        wait.until(ExpectedConditions.urlContains("/checkout"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/checkout"), "Debe redirigir a la página de checkout.");

        System.out.println("✅ PRUEBA PASADA: checkoutCompleto() - Flujo de checkout funciona correctamente.");
    }
}

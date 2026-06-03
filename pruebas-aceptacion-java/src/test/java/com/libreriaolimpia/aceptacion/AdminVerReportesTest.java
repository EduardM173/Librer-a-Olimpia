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
// HISTORIA DE USUARIO: Como administrador quiero ver reportes estadísticos.
//
// PRUEBA DE ACEPTACION: adminVerReportes() - El admin accede a la vista de reportes.
//
// Paso 1. Iniciar sesión como administrador.
// Paso 2. Navegar a /admin/reportes.
// Paso 3. Verificar que se muestra el panel de estadísticas.
//
// Resultado Esperado: La página de reportes carga con métricas o gráficos visuales.
/****************************************/

public class AdminVerReportesTest {

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
    public void adminVerReportes() {
        /************** 1. PREPARACIÓN DE LA PRUEBA ***********/
        driver.get(BASE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try { Thread.sleep(2000); } catch (Exception e) {}

        /************** 2. LÓGICA DE LA PRUEBA ***************/
        System.out.println("Paso 1: Iniciar sesión como administrador.");
        driver.findElement(By.xpath("//button[contains(text(),'Iniciar sesión') or contains(@class,'btn-login')]")).click();
        try { Thread.sleep(2000); } catch (Exception e) {}
        
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(translate(text(), 'SESIÓN', 'sesión'),'sesión') or contains(text(),'Login')]")));
        driver.findElement(By.xpath("//input[@type='email']")).sendKeys("admin@olimpia.com");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("admin123");
        try { Thread.sleep(1000); } catch (Exception e) {}
        
        driver.findElement(By.xpath("//button[@type='submit' and contains(text(),'Iniciar')]")).click();

        try { Thread.sleep(3000); } catch (Exception e) {}

        System.out.println("Paso 2: Navegar a Vista de Reportes.");
        driver.get(BASE_URL + "/admin/reportes");
        try { Thread.sleep(2000); } catch (Exception e) {}

        /************ 3. VERIFICACIÓN DEL RESULTADO ESPERADO ***************/
        System.out.println("Paso 3: Verificar carga de la página.");
        WebElement titulo = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//h1[contains(text(),'Dashboard') or contains(text(),'Reportes')]")));
            
        WebElement panel = wait.until(ExpectedConditions.presenceOfElementLocated(
            By.xpath("//div[contains(@class,'report') or contains(@class,'chart') or contains(@class,'card') or contains(@class,'dashboard')] | //canvas")));

        Assert.assertTrue(titulo.isDisplayed(), "El título de reportes debe estar visible.");
        Assert.assertNotNull(panel, "El panel de estadísticas o gráficos debe estar presente.");

        System.out.println("✅ PRUEBA PASADA: adminVerReportes() - Interfaz de reportes para Admin carga correctamente.");
    }
}

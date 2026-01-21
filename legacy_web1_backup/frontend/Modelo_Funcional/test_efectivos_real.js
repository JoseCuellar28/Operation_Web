// Script de prueba para asignación de efectivos policiales
// Simula exactamente el comportamiento del usuario

class TestEfectivos {
    constructor() {
        this.resultados = [];
        this.testActual = 0;
        this.totalTests = 10;
    }

    async iniciarTestCompleto() {
        console.log('🧪 INICIANDO TEST SISTEMÁTICO DE EFECTIVOS POLICIALES');
        console.log('📅 Fecha y hora:', new Date().toLocaleString());
        console.log('🎯 Objetivo: Identificar por qué las asignaciones no funcionan en el primer intento');
        console.log('📊 Total de pruebas:', this.totalTests);
        console.log('=' .repeat(80));

        for (let i = 1; i <= this.totalTests; i++) {
            await this.realizarTest(i);
            await this.esperar(2000); // Esperar 2 segundos entre tests
        }

        this.mostrarResumenFinal();
    }

    async realizarTest(numeroTest) {
        this.testActual = numeroTest;
        console.log(`\n🧪 TEST ${numeroTest}/${this.totalTests} - INICIANDO`);
        console.log(`⏰ Hora: ${new Date().toLocaleTimeString()}`);

        const testData = {
            numero: numeroTest,
            timestamp: new Date().toISOString(),
            efectivo: `Oficial Test ${numeroTest}`,
            detalle: `Prueba ${numeroTest} - ${new Date().toLocaleTimeString()}`,
            puntosSeleccionados: [],
            asignacionesAntes: 0,
            asignacionesDespues: 0,
            exito: false,
            intentos: 1,
            errores: [],
            logs: []
        };

        try {
            // Paso 1: Verificar estado inicial
            testData.logs.push('📋 Verificando estado inicial...');
            testData.asignacionesAntes = window.asignaciones ? window.asignaciones.length : 0;
            testData.logs.push(`📊 Asignaciones antes: ${testData.asignacionesAntes}`);

            // Paso 2: Verificar marcadores seleccionados
            if (!window.marcadoresSeleccionados || window.marcadoresSeleccionados.length === 0) {
                testData.errores.push('❌ No hay marcadores seleccionados');
                testData.logs.push('⚠️ Simulando selección de marcador...');
                // Simular marcador seleccionado
                window.marcadoresSeleccionados = [{
                    id: `test_marker_${numeroTest}`,
                    lat: 40.7128 + (numeroTest * 0.001),
                    lng: -74.0060 + (numeroTest * 0.001),
                    tipo: 'test'
                }];
            }

            testData.puntosSeleccionados = [...window.marcadoresSeleccionados];
            testData.logs.push(`📍 Puntos seleccionados: ${testData.puntosSeleccionados.length}`);

            // Paso 3: Simular selección de efectivo
            const efectivoData = {
                nombre: testData.efectivo,
                rango: 'Sargento',
                id: `efectivo_${numeroTest}`,
                disponible: true
            };

            testData.logs.push(`👮 Simulando selección de: ${efectivoData.nombre}`);

            // Paso 4: Ejecutar función de asignación
            if (typeof window.seleccionarEfectivo === 'function') {
                testData.logs.push('🔧 Ejecutando seleccionarEfectivo...');
                
                // Capturar logs de la función
                const originalLog = console.log;
                const capturedLogs = [];
                console.log = function(...args) {
                    capturedLogs.push(args.join(' '));
                    originalLog.apply(console, args);
                };

                try {
                    await window.seleccionarEfectivo(
                        efectivoData.nombre,
                        efectivoData.rango,
                        efectivoData.id
                    );
                    testData.logs.push('✅ Función ejecutada sin errores');
                } catch (error) {
                    testData.errores.push(`❌ Error en seleccionarEfectivo: ${error.message}`);
                }

                // Restaurar console.log
                console.log = originalLog;
                testData.logs = testData.logs.concat(capturedLogs);

            } else {
                testData.errores.push('❌ Función seleccionarEfectivo no encontrada');
            }

            // Paso 5: Verificar resultado
            await this.esperar(500); // Esperar para que se procese la asignación
            
            testData.asignacionesDespues = window.asignaciones ? window.asignaciones.length : 0;
            testData.exito = testData.asignacionesDespues > testData.asignacionesAntes;

            testData.logs.push(`📊 Asignaciones después: ${testData.asignacionesDespues}`);
            testData.logs.push(`📈 Diferencia: +${testData.asignacionesDespues - testData.asignacionesAntes}`);

            if (testData.exito) {
                console.log(`✅ TEST ${numeroTest}: Asignación exitosa`);
                testData.logs.push('🎉 Asignación completada exitosamente');
            } else {
                console.log(`❌ TEST ${numeroTest}: Asignación falló`);
                testData.logs.push('💥 Asignación falló - no se detectaron cambios');
            }

        } catch (error) {
            testData.errores.push(`❌ Error general: ${error.message}`);
            testData.exito = false;
        }

        this.resultados.push(testData);
        this.mostrarResultadoTest(testData);
    }

    mostrarResultadoTest(testData) {
        const icon = testData.exito ? '✅' : '❌';
        const estado = testData.exito ? 'ÉXITO' : 'FALLO';
        
        console.log(`\n${icon} RESULTADO TEST ${testData.numero}:`);
        console.log(`📊 Estado: ${estado}`);
        console.log(`👮 Efectivo: ${testData.efectivo}`);
        console.log(`📍 Puntos: ${testData.puntosSeleccionados.length}`);
        console.log(`📈 Asignaciones: ${testData.asignacionesAntes} → ${testData.asignacionesDespues}`);
        
        if (testData.errores.length > 0) {
            console.log('🚨 Errores detectados:');
            testData.errores.forEach(error => console.log(`   ${error}`));
        }
        
        console.log('📋 Log detallado:');
        testData.logs.forEach(log => console.log(`   ${log}`));
    }

    mostrarResumenFinal() {
        const exitosos = this.resultados.filter(t => t.exito).length;
        const fallidos = this.resultados.filter(t => !t.exito).length;
        const tasaExito = (exitosos / this.resultados.length * 100).toFixed(1);

        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMEN FINAL DEL TEST');
        console.log('='.repeat(80));
        console.log(`✅ Tests exitosos: ${exitosos}/${this.totalTests}`);
        console.log(`❌ Tests fallidos: ${fallidos}/${this.totalTests}`);
        console.log(`📈 Tasa de éxito: ${tasaExito}%`);
        console.log(`⏰ Hora de finalización: ${new Date().toLocaleTimeString()}`);

        // Análisis de patrones
        this.analizarPatrones();
        
        // Recomendaciones
        this.generarRecomendaciones(tasaExito);
    }

    analizarPatrones() {
        console.log('\n🔍 ANÁLISIS DE PATRONES:');
        
        // Analizar errores comunes
        const erroresComunes = {};
        this.resultados.forEach(test => {
            test.errores.forEach(error => {
                erroresComunes[error] = (erroresComunes[error] || 0) + 1;
            });
        });

        if (Object.keys(erroresComunes).length > 0) {
            console.log('🚨 Errores más frecuentes:');
            Object.entries(erroresComunes)
                .sort(([,a], [,b]) => b - a)
                .forEach(([error, count]) => {
                    console.log(`   ${error} (${count} veces)`);
                });
        }

        // Analizar distribución temporal
        const fallosEnPrimerosTres = this.resultados.slice(0, 3).filter(t => !t.exito).length;
        const fallosEnUltimosTres = this.resultados.slice(-3).filter(t => !t.exito).length;
        
        console.log(`📊 Fallos en primeros 3 tests: ${fallosEnPrimerosTres}/3`);
        console.log(`📊 Fallos en últimos 3 tests: ${fallosEnUltimosTres}/3`);
        
        if (fallosEnPrimerosTres > fallosEnUltimosTres) {
            console.log('🔍 PATRÓN DETECTADO: Mayor tasa de fallo en tests iniciales');
            console.log('💡 Posible causa: Inicialización de estado o condiciones de carrera');
        }
    }

    generarRecomendaciones(tasaExito) {
        console.log('\n💡 RECOMENDACIONES:');
        
        if (tasaExito < 50) {
            console.log('🔧 CRÍTICO: Tasa de éxito muy baja');
            console.log('   - Revisar lógica de seleccionarEfectivo()');
            console.log('   - Verificar estado de marcadoresSeleccionados');
            console.log('   - Implementar validaciones adicionales');
        } else if (tasaExito < 80) {
            console.log('⚠️ MODERADO: Tasa de éxito mejorable');
            console.log('   - Investigar condiciones de carrera');
            console.log('   - Añadir delays o callbacks');
            console.log('   - Mejorar manejo de errores');
        } else {
            console.log('✅ BUENO: Tasa de éxito aceptable');
            console.log('   - Monitorear comportamiento en producción');
            console.log('   - Considerar optimizaciones menores');
        }
    }

    async esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Función para ejecutar el test desde la consola
window.ejecutarTestEfectivos = async function() {
    const test = new TestEfectivos();
    await test.iniciarTestCompleto();
    return test.resultados;
};

console.log('🧪 Test de Efectivos cargado. Ejecuta: ejecutarTestEfectivos()');
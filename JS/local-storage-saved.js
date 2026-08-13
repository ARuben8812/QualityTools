// ==================== AUTO-GUARDADO INMEDIATO EN LOCALSTORAGE ====================

// Función para guardar UN SOLO campo específico en localStorage
function saveFieldToStorage(fieldId, value) {
    try {
        // Obtener datos existentes o crear objeto vacío
        let formData = localStorage.getItem('bottleFormData');
        formData = formData ? JSON.parse(formData) : {};
        
        // Actualizar el campo específico
        formData[fieldId] = value;
        
        // Guardar en localStorage
        localStorage.setItem('bottleFormData', JSON.stringify(formData));
        
    } catch (error) {
        console.error('Error al guardar campo:', fieldId, error);
    }
}

// Función para guardar TODOS los campos (útil para radio buttons y selects)
function saveAllFormData() {
    try {
        const formData = {};
        
        // 1. Datos Generales (inputs)
        const generalFields = [
            'fecha', 'cliente', 'proveedor', 'producto', 'presentacion',
            'cant_botellas', 'num_paletas', 'densidad', 'codigo',
            'cod_juliano', 'lote', 'num_factura', 'num_qr'
        ];
        generalFields.forEach(field => {
            const element = document.getElementById(`input_${field}`);
            if (element) formData[`input_${field}`] = element.value;
        });
        
        // 2. Tipo de botella (radio buttons)
        const tipoBotella = document.querySelector('input[name="tipo_botella"]:checked');
        if (tipoBotella) formData['tipo_botella'] = tipoBotella.value;
        
        // 3. Parámetros Cualitativos (selects)
        const paramFields = [
            'punto_llenado', 'punto_fragil', 'vidrio_frio',
            'dimensiones', 'superficie_regular'
        ];
        paramFields.forEach(field => {
            const element = document.getElementById(`param_${field}`);
            if (element) formData[`param_${field}`] = element.value;
        });
        
        // 4. Campos adicionales
        const extraFields = ['fp_ref', 'p_vacio_minmax', 'prof_llenado_minmax', 'observaciones_gen'];
        extraFields.forEach(field => {
            const element = document.getElementById(`input_${field}`);
            if (element) formData[`input_${field}`] = element.value;
        });
        
        // 5. Sample count
        const sampleCount = document.getElementById('sample_count_select');
        if (sampleCount) formData['sample_count_select'] = sampleCount.value;
        
        // 6. Datos de la tabla de muestras
        const sampleRows = document.querySelectorAll('#samplesTbody tr');
        const samplesData = [];
        sampleRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length > 0) {
                const sample = {};
                const fields = ['p_vacio', 'cavidad', 'observacion', 'p_lleno', 'volumen', 'dif', 'desv'];
                inputs.forEach((input, idx) => {
                    if (idx < fields.length) {
                        sample[fields[idx]] = input.value;
                    }
                });
                samplesData.push(sample);
            }
        });
        formData['samples'] = samplesData;
        
        // 7. Resultados (para visualización)
        const results = ['vol_promedio', 'dif_promedio', 'desv_maxima'];
        results.forEach(result => {
            const element = document.getElementById(`res_${result}`);
            if (element) formData[`res_${result}`] = element.textContent;
        });
        
        // Guardar todo en localStorage
        localStorage.setItem('bottleFormData', JSON.stringify(formData));
        
    } catch (error) {
        console.error('Error al guardar todos los datos:', error);
    }
}

// ==================== CONFIGURACIÓN DE EVENTOS POR CAMPO ====================

// Función para configurar el auto-guardado de UN SOLO input
function setupAutoSaveField(element) {
    if (!element) return;
    
    // Para inputs de texto y number - guardar en cada cambio
    if (element.type === 'text' || element.type === 'number' || 
        element.type === 'date' || element.tagName === 'TEXTAREA') {
        element.addEventListener('input', function() {
            saveFieldToStorage(this.id, this.value);
        });
        element.addEventListener('change', function() {
            saveFieldToStorage(this.id, this.value);
        });
    }
    
    // Para selects - guardar en cada cambio
    if (element.tagName === 'SELECT') {
        element.addEventListener('change', function() {
            saveFieldToStorage(this.id, this.value);
        });
    }
    
    // Para radio buttons - guardar en cada click
    if (element.type === 'radio') {
        element.addEventListener('click', function() {
            if (this.checked) {
                saveAllFormData(); // Guardar todos porque los radios se agrupan
            }
        });
    }
}

// ==================== INICIALIZACIÓN ====================

// Función para cargar datos guardados
function loadAllFormData() {
    try {
        const savedData = localStorage.getItem('bottleFormData');
        if (!savedData) {
            console.log('No hay datos guardados');
            return;
        }
        
        const formData = JSON.parse(savedData);
        console.log('Cargando datos guardados...');
        
        // Cargar cada campo individualmente
        Object.keys(formData).forEach(key => {
            // Si es un campo de input
            if (key.startsWith('input_')) {
                const element = document.getElementById(key);
                if (element) {
                    element.value = formData[key];
                }
            }
            // Si es un parámetro
            else if (key.startsWith('param_')) {
                const element = document.getElementById(key);
                if (element) {
                    element.value = formData[key];
                }
            }
            // Si es tipo de botella (radio)
            else if (key === 'tipo_botella') {
                const radio = document.querySelector(`input[name="tipo_botella"][value="${formData[key]}"]`);
                if (radio) radio.checked = true;
            }
            // Si es sample count
            else if (key === 'sample_count_select') {
                const element = document.getElementById('sample_count_select');
                if (element) {
                    element.value = formData[key];
                    // Disparar el cambio para actualizar la tabla
                    if (typeof changeSampleCount === 'function') {
                        changeSampleCount();
                    }
                }
            }
            // Si son resultados
            else if (key.startsWith('res_')) {
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = formData[key];
                }
            }
        });
        
        // Cargar samples después de que la tabla esté lista
        if (formData.samples && formData.samples.length > 0) {
            setTimeout(() => {
                const rows = document.querySelectorAll('#samplesTbody tr');
                formData.samples.forEach((sampleData, index) => {
                    if (index < rows.length) {
                        const inputs = rows[index].querySelectorAll('input');
                        const fields = ['p_vacio', 'cavidad', 'observacion', 'p_lleno', 'volumen', 'dif', 'desv'];
                        inputs.forEach((input, idx) => {
                            if (idx < fields.length && sampleData[fields[idx]] !== undefined) {
                                input.value = sampleData[fields[idx]];
                            }
                        });
                    }
                });
            }, 150);
        }
        
        console.log('Datos cargados correctamente');
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// Función para configurar todos los campos del formulario
function setupAllAutoSave() {
    // 1. Todos los inputs (text, number, date)
    document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]').forEach(input => {
        setupAutoSaveField(input);
    });
    
    // 2. Todos los textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        setupAutoSaveField(textarea);
    });
    
    // 3. Todos los selects
    document.querySelectorAll('select').forEach(select => {
        setupAutoSaveField(select);
    });
    
    // 4. Todos los radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        setupAutoSaveField(radio);
    });
    
    // 5. Especial para la tabla de muestras (inputs dinámicos)
    // Se configurarán cuando se agreguen nuevas filas
    setupSampleTableAutoSave();
}

// Función para configurar auto-guardado en la tabla de muestras
function setupSampleTableAutoSave() {
    // Observar cambios en la tabla de muestras
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Configurar auto-guardado para nuevas filas
                document.querySelectorAll('#samplesTbody tr').forEach(row => {
                    row.querySelectorAll('input').forEach(input => {
                        // Evitar duplicar eventos
                        if (!input.dataset.autosaveConfigured) {
                            setupAutoSaveField(input);
                            input.dataset.autosaveConfigured = 'true';
                        }
                    });
                });
            }
        });
    });
    
    const tbody = document.getElementById('samplesTbody');
    if (tbody) {
        observer.observe(tbody, { childList: true, subtree: true });
    }
}

// ==================== INICIALIZACIÓN PRINCIPAL ====================

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar auto-guardado para todos los campos
    setupAllAutoSave();
    
    // Cargar datos guardados
    loadAllFormData();
    
    // Guardar todo cuando se cierre la página
    window.addEventListener('beforeunload', function() {
        saveAllFormData();
    });
    
    // Guardar también cuando se haga click en el botón de imprimir
    // Modificar la función original si existe
    const originalGenerate = window.generateAndPrintReport;
    if (typeof originalGenerate === 'function') {
        window.generateAndPrintReport = function() {
            saveAllFormData(); // Guardar antes de imprimir
            originalGenerate();
        };
    }
    
    console.log('✅ Auto-guardado INMEDIATO configurado correctamente');
});

// ==================== FUNCIONES DE UTILIDAD (OPCIONALES) ====================

// Función para ver qué datos están guardados (para debugging)
function checkSavedData() {
    const data = localStorage.getItem('bottleFormData');
    if (data) {
        console.log('📦 Datos guardados:', JSON.parse(data));
        return JSON.parse(data);
    } else {
        console.log('❌ No hay datos guardados');
        return null;
    }
}

// Función para limpiar todos los datos guardados
// function clearAllSavedData() {
//     if (confirm('¿Eliminar todos los datos guardados?')) {
//         localStorage.removeItem('bottleFormData');
//         console.log('🗑️ Datos eliminados');
//         location.reload();
//     }
// }

// Función para guardar manualmente (si se necesita)
function forceSave() {
    saveAllFormData();
    console.log('💾 Datos guardados manualmente');
}

// Exportar funciones para uso global
window.checkSavedData = checkSavedData;
window.clearAllSavedData = clearAllSavedData;
window.forceSave = forceSave;
window.saveAllFormData = saveAllFormData;

console.log('🚀 Sistema de auto-guardado listo');
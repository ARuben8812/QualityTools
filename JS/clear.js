// ==================== FUNCIÓN PARA LIMPIAR TODO ====================

function clearAllFormData() {
    // Confirmar antes de limpiar
    if (!confirm('⚠️ ¿Estás seguro de que quieres limpiar TODOS los datos?\n\nSe eliminarán:\n- Todos los campos del formulario\n- Todos los datos guardados en localStorage\n\nEsta acción NO se puede deshacer.')) {
        return;
    }
    
    try {
        // 1. Limpiar localStorage
        localStorage.removeItem('bottleFormData');
        console.log('🗑️ Datos eliminados del localStorage');
        
        // 2. Limpiar TODOS los inputs de texto y número
        document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]').forEach(input => {
            input.value = '';
        });
        
        // 3. Limpiar textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.value = '';
        });
        
        // 4. Resetear selects a su primera opción
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // 5. Resetear radio buttons al primer valor (PET)
        const radioPET = document.querySelector('input[name="tipo_botella"][value="PET"]');
        if (radioPET) radioPET.checked = true;
        
        // 6. Limpiar campos de resultados (divs con resultados)
        document.querySelectorAll('#res_vol_promedio, #res_dif_promedio, #res_desv_maxima').forEach(element => {
            element.textContent = '0.00';
        });
        
        // 7. Limpiar la tabla de muestras
        const sampleRows = document.querySelectorAll('#samplesTbody tr');
        sampleRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = '';
            });
        });
        
        // 8. Resetear el select de muestras a 8
        const sampleSelect = document.getElementById('sample_count_select');
        if (sampleSelect) {
            sampleSelect.value = '8';
            // Disparar el cambio para regenerar la tabla
            if (typeof changeSampleCount === 'function') {
                changeSampleCount();
            }
        }
        
        // 9. Resetear campos específicos con valores por defecto
        const defaultValues = {
            'input_num_paletas': '18',
            'input_densidad': '1 g/ml',
            'input_codigo': '---'
        };
        
        Object.keys(defaultValues).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = defaultValues[id];
            }
        });
        
        // 10. Mostrar mensaje de éxito
        showNotification('✅ Todos los datos han sido limpiados correctamente', 'success');
        
        console.log('🧹 Formulario limpiado completamente');
        
    } catch (error) {
        console.error('Error al limpiar datos:', error);
        showNotification('❌ Error al limpiar los datos', 'error');
    }
}

// Función para mostrar notificaciones (opcional pero recomendada)
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Colores según el tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#007bff';
    }
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Agregar estilos para la animación
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(styleSheet);

// Exportar función para uso global
window.clearAllFormData = clearAllFormData;
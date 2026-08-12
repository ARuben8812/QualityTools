        let currentSampleCount = 8;

        window.onload = function() {
            const dateInput = document.getElementById('input_fecha');
            dateInput.valueAsDate = new Date();
            calculateJulianCode(new Date());
            renderSampleRows();

            // =========== NUEVO: Navegación con Enter (funciona en móvil y escritorio) ===========
            const tbody = document.getElementById('samplesTbody');
            tbody.addEventListener('keydown', function(e) {
                const target = e.target;
                if (target.tagName === 'INPUT') {
                    const key = e.key || e.keyCode;
                    // Compatibilidad: 'Enter' o código 13
                    if (key === 'Enter' || key === 13) {
                        e.preventDefault(); // Evita salto de línea o envío de formulario
                        const td = target.closest('td');
                        if (!td) return;
                        const tr = td.closest('tr');
                        if (!tr) return;
                        const cellIndex = td.cellIndex; // Índice de columna (0-based)
                        const nextRow = tr.nextElementSibling;
                        if (nextRow) {
                            const nextTd = nextRow.children[cellIndex];
                            if (nextTd) {
                                const nextInput = nextTd.querySelector('input');
                                if (nextInput) {
                                    nextInput.focus();
                                    // Selecciona el contenido para facilitar reescritura en móvil
                                    nextInput.select();
                                }
                            }
                        }
                        // Si es la última fila, no hace nada
                    }
                }
            });
        };

        function loadLogo(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgElem = document.getElementById('rpt_logo_img');
                    const textElem = document.getElementById('rpt_logo_text');
                    imgElem.src = e.target.result;
                    imgElem.style.display = 'block';
                    textElem.style.display = 'none';
                    document.getElementById('logo_status').innerText = '✓ Logo cargado correctamente';
                };
                reader.readAsDataURL(file);
            }
        }

        function calculateJulianCode(dateObj) {
            if (!dateObj || isNaN(dateObj.getTime())) {
                document.getElementById('input_cod_juliano').value = '';
                return;
            }
            const year = dateObj.getFullYear();
            const lastYearDigit = year.toString().slice(-1);
            const startOfYear = new Date(year, 0, 1);
            const diff = dateObj - startOfYear;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay) + 1;
            const paddedDay = String(dayOfYear).padStart(3, '0');
            document.getElementById('input_cod_juliano').value = `${lastYearDigit}${paddedDay}`;
        }

        function onDateChange() {
            const val = document.getElementById('input_fecha').value;
            if (val) {
                const parts = val.split('-');
                const d = new Date(parts[0], parts[1] - 1, parts[2]);
                calculateJulianCode(d);
            }
        }

        function changeSampleCount() {
            currentSampleCount = parseInt(document.getElementById('sample_count_select').value);
            renderSampleRows();
        }

        function renderSampleRows() {
            const tbody = document.getElementById('samplesTbody');
            tbody.innerHTML = '';
            for (let i = 1; i <= currentSampleCount; i++) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${i}</strong></td>
                    <td><input type="number" step="0.01" id="p_vacio_${i}" oninput="calculateData()"></td>
                    <td><input type="text" id="cavidad_${i}"></td>
                    <td><input type="text" id="observacion_${i}"></td>
                    <td><input type="number" step="0.01" id="p_lleno_${i}" oninput="calculateData()"></td>
                    <td><input type="number" step="0.01" id="volumen_${i}" oninput="calculateData()"></td>
                    <td><input type="number" step="0.01" id="dif_${i}" readonly></td>
                    <td><input type="number" step="0.01" id="desv_${i}" readonly></td>
                    
                `;
                tbody.appendChild(tr);
            }
            autofillPesoLleno();
        }

        function autofillPesoLleno() {
            const presentacionVal = document.getElementById('input_presentacion').value;
            const match = presentacionVal.match(/[\d.]+/);
            const numVal = match ? match[0] : '';
            for (let i = 1; i <= currentSampleCount; i++) {
                const pLlenoElem = document.getElementById(`p_lleno_${i}`);
                if (pLlenoElem) {
                    pLlenoElem.value = numVal;
                }
            }
            calculateData();
        }

        function calculateData() {
            let totalVol = 0, totalDif = 0, countVol = 0, countDif = 0;
            let difs = [], pVacios = [];

            for (let i = 1; i <= currentSampleCount; i++) {
                const pLleno = parseFloat(document.getElementById(`p_lleno_${i}`).value) || 0;
                const volumen = parseFloat(document.getElementById(`volumen_${i}`).value) || 0;
                const pVacioVal = parseFloat(document.getElementById(`p_vacio_${i}`).value);
                const difInput = document.getElementById(`dif_${i}`);

                if (!isNaN(pVacioVal) && document.getElementById(`p_vacio_${i}`).value.trim() !== "") {
                    pVacios.push(pVacioVal);
                }

                let dif = 0;
                if (document.getElementById(`volumen_${i}`).value !== "" && document.getElementById(`p_lleno_${i}`).value !== "") {
                    dif = volumen - pLleno;
                    difInput.value = dif.toFixed(2);
                    totalDif += dif;
                    countDif++;
                } else {
                    difInput.value = "";
                }
                difs.push(dif);

                if (document.getElementById(`volumen_${i}`).value !== "") {
                    totalVol += volumen;
                    countVol++;
                }
            }

            const avgVol = countVol > 0 ? (totalVol / countVol) : 0;
            const avgDif = countDif > 0 ? (totalDif / countDif) : 0;

            let maxDesv = -Infinity;
            let hasValidDesv = false;

            for (let i = 1; i <= currentSampleCount; i++) {
                const desvInput = document.getElementById(`desv_${i}`);
                if (document.getElementById(`dif_${i}`).value !== "") {
                    const desv = Math.abs(avgDif - difs[i - 1]);
                    desvInput.value = desv.toFixed(2);
                    if (desv > maxDesv) maxDesv = desv;
                    hasValidDesv = true;
                } else {
                    desvInput.value = "";
                }
            }

            const inputMinMax = document.getElementById('input_p_vacio_minmax');
            if (pVacios.length > 0) {
                const minVal = Math.min(...pVacios).toFixed(2);
                const maxVal = Math.max(...pVacios).toFixed(2);
                inputMinMax.value = `${minVal} / ${maxVal}`;
            } else {
                inputMinMax.value = "";
            }

            document.getElementById('res_vol_promedio').innerText = avgVol.toFixed(2);
            document.getElementById('res_dif_promedio').innerText = avgDif.toFixed(2);
            document.getElementById('res_desv_maxima').innerText = hasValidDesv ? maxDesv.toFixed(2) : "0.00";
        }

        function generateAndPrintReport() {
            // Llenar campos del reporte
            document.getElementById('rpt_fecha').innerText = document.getElementById('input_fecha').value;
            document.getElementById('rpt_cliente').innerText = document.getElementById('input_cliente').value;
            document.getElementById('rpt_proveedor').innerText = document.getElementById('input_proveedor').value;
            document.getElementById('rpt_producto').innerText = document.getElementById('input_producto').value;
            document.getElementById('rpt_presentacion').innerText = document.getElementById('input_presentacion').value;
            document.getElementById('rpt_cant_botellas').innerText = document.getElementById('input_cant_botellas').value;
            document.getElementById('rpt_num_paletas').innerText = document.getElementById('input_num_paletas').value;
            document.getElementById('rpt_densidad').innerText = document.getElementById('input_densidad').value;
            document.getElementById('rpt_codigo').innerText = document.getElementById('input_codigo').value;
            document.getElementById('rpt_cod_juliano').innerText = document.getElementById('input_cod_juliano').value;
            document.getElementById('rpt_lote').innerText = document.getElementById('input_lote').value;
            document.getElementById('rpt_num_factura').innerText = document.getElementById('input_num_factura').value;
            document.getElementById('rpt_num_qr').innerText = document.getElementById('input_num_qr').value;

            const tipoBotella = document.querySelector('input[name="tipo_botella"]:checked').value;
            document.getElementById('rpt_pet_check').innerText = tipoBotella === 'PET' ? '[X]' : '[ ]';
            document.getElementById('rpt_vidrio_check').innerText = tipoBotella === 'VIDRIO' ? '[X]' : '[ ]';

            const mapCheck = (val, targetC, targetNC) => {
                if (val === 'OK') {
                    document.getElementById(targetC).innerText = 'X';
                    document.getElementById(targetNC).innerText = '';
                } else if (val === 'NOK') {
                    document.getElementById(targetC).innerText = '';
                    document.getElementById(targetNC).innerText = 'X';
                } else if (val === 'NA') {
                    document.getElementById(targetC).innerText = 'NA';
                    document.getElementById(targetNC).innerText = 'NA';
                } else {
                    document.getElementById(targetC).innerText = '';
                    document.getElementById(targetNC).innerText = '';
                }
            };

            mapCheck(document.getElementById('param_punto_llenado').value, 'rpt_pj_c', 'rpt_pj_nc');
            mapCheck(document.getElementById('param_vidrio_frio').value, 'rpt_vf_c', 'rpt_vf_nc');
            mapCheck(document.getElementById('param_superficie_regular').value, 'rpt_sr_c', 'rpt_sr_nc');
            mapCheck(document.getElementById('param_punto_fragil').value, 'rpt_pf_c', 'rpt_pf_nc');
            mapCheck(document.getElementById('param_dimensiones').value, 'rpt_dim_c', 'rpt_dim_nc');

            // Construir tabla de muestras
            const rptTbody = document.getElementById('rpt_samples_body');
            rptTbody.innerHTML = '';

            for (let i = 1; i <= 13; i++) {
                const isOutOfRange = i > currentSampleCount;
                
                let pVacio = document.getElementById(`p_vacio_${i}`)?.value || '---';
                let pLleno = document.getElementById(`p_lleno_${i}`)?.value || '---';
                let vol = document.getElementById(`volumen_${i}`)?.value || '---';
                let dif = document.getElementById(`dif_${i}`)?.value || '---';
                let desv = document.getElementById(`desv_${i}`)?.value || '---';
                let cavidad = document.getElementById(`cavidad_${i}`)?.value || '---';
                let obs = document.getElementById(`observacion_${i}`)?.value || '---';

                const tr = document.createElement('tr');

                if (isOutOfRange || (pVacio === '' && pLleno === '' && vol === '' && dif === '' && desv === '' && cavidad === '' && obs === '')) {
                    tr.innerHTML = `<td>${i}</td>` + '<td class="diagonal-cell"></td>'.repeat(7);
                } else {
                    tr.innerHTML = `
                        <td>${i}</td>
                        <td>${pVacio}</td>                   
                        <td>${pLleno}</td>
                        <td>${vol}</td>
                        <td>${dif}</td>
                        <td>${desv}</td>
                        <td>${cavidad}</td>
                        <td class='obs-style'>${obs}</td>
                    `;
                }
                rptTbody.appendChild(tr);
            }

            document.getElementById('rpt_tot_vol').innerText = document.getElementById('res_vol_promedio').innerText;
            document.getElementById('rpt_tot_dif').innerText = document.getElementById('res_dif_promedio').innerText;
            document.getElementById('rpt_tot_desv').innerText = document.getElementById('res_desv_maxima').innerText;

            document.getElementById('rpt_fp_ref').innerText = document.getElementById('input_fp_ref').value || '';
            document.getElementById('rpt_vol_prom_fp').innerText = document.getElementById('res_vol_promedio').innerText;
            document.getElementById('rpt_desv_max').innerText = document.getElementById('res_desv_maxima').innerText;
            document.getElementById('rpt_p_vacio_minmax').innerText = document.getElementById('input_p_vacio_minmax').value || '';
            document.getElementById('rpt_prof_minmax').innerText = document.getElementById('input_prof_llenado_minmax').value || '';
            document.getElementById('rpt_observaciones_gen').innerText = document.getElementById('input_observaciones_gen').value || '';

            window.print();
        }
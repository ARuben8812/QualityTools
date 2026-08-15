let currentSampleCount = 8;

window.onload = function () {
  const dateInput = document.getElementById("input_fecha");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
  calculateJulianCode(new Date());
  renderSampleRows();

  // =========== Navegación con Enter (funciona en móvil y escritorio) ===========
  const tbody = document.getElementById("samplesTbody");
  if (tbody) {
    tbody.addEventListener("keydown", function (e) {
      const target = e.target;
      if (target.tagName === "INPUT") {
        const key = e.key || e.keyCode;
        if (key === "Enter" || key === 13) {
          e.preventDefault();
          const td = target.closest("td");
          if (!td) return;
          const tr = td.closest("tr");
          if (!tr) return;
          const cellIndex = td.cellIndex;
          const nextRow = tr.nextElementSibling;
          if (nextRow) {
            const nextTd = nextRow.children[cellIndex];
            if (nextTd) {
              const nextInput = nextTd.querySelector("input");
              if (nextInput) {
                nextInput.focus();
                nextInput.select();
              }
            }
          }
        }
      }
    });
  }
};

function loadLogo(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgElem = document.getElementById("rpt_logo_img");
      const textElem = document.getElementById("rpt_logo_text");
      if (imgElem) {
        imgElem.src = e.target.result;
        imgElem.style.display = "block";
      }
      if (textElem) textElem.style.display = "none";
      const statusElem = document.getElementById("logo_status");
      if (statusElem) statusElem.innerText = "✓ Logo cargado correctamente";
    };
    reader.readAsDataURL(file);
  }
}

function calculateJulianCode(dateObj) {
  const julianoInput = document.getElementById("input_cod_juliano");
  if (!julianoInput) return;

  if (!dateObj || isNaN(dateObj.getTime())) {
    julianoInput.value = "";
    return;
  }
  const year = dateObj.getFullYear();
  const lastYearDigit = year.toString().slice(-1);
  const startOfYear = new Date(year, 0, 1);
  const diff = dateObj - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1;
  const paddedDay = String(dayOfYear).padStart(3, "0");
  julianoInput.value = `${lastYearDigit}${paddedDay}`;
}

function onDateChange() {
  const val = document.getElementById("input_fecha")?.value;
  if (val) {
    const parts = val.split("-");
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    calculateJulianCode(d);
  }
}

function changeSampleCount() {
  const select = document.getElementById("sample_count_select");
  if (select) {
    currentSampleCount = parseInt(select.value, 10);
  }
  renderSampleRows();
}

function renderSampleRows() {
  const tbody = document.getElementById("samplesTbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  for (let i = 1; i <= currentSampleCount; i++) {
    const tr = document.createElement("tr");
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

  setTimeout(() => {
    // Si la función de auto-guardado existe en otro JS cargado, la ejecuta
    if (typeof setupSampleTableAutoSave === "function") {
      setupSampleTableAutoSave();
    }
    if (typeof saveFieldToStorage === "function") {
      const select = document.getElementById("sample_count_select");
      if (select) {
        saveFieldToStorage("sample_count_select", select.value);
      }
    }
  }, 100);
}

function autofillPesoLleno() {
  const presElem = document.getElementById("input_presentacion");
  const presentacionVal = presElem ? presElem.value : "";
  const match = presentacionVal.match(/[\d.]+/);
  const numVal = match ? match[0] : "";

  for (let i = 1; i <= currentSampleCount; i++) {
    const pLlenoElem = document.getElementById(`p_lleno_${i}`);
    if (pLlenoElem) {
      pLlenoElem.value = numVal;
    }
  }
  calculateData();
}

function calculateData() {
  let totalVol = 0,
    totalDif = 0,
    countVol = 0,
    countDif = 0;
  let difs = [],
    pVacios = [];

  for (let i = 1; i <= currentSampleCount; i++) {
    const pLlenoElem = document.getElementById(`p_lleno_${i}`);
    const volElem = document.getElementById(`volumen_${i}`);
    const pVacioElem = document.getElementById(`p_vacio_${i}`);
    const difInput = document.getElementById(`dif_${i}`);

    const pLleno = pLlenoElem ? parseFloat(pLlenoElem.value) || 0 : 0;
    const volumen = volElem ? parseFloat(volElem.value) || 0 : 0;
    const pVacioVal = pVacioElem ? parseFloat(pVacioElem.value) : NaN;

    if (
      pVacioElem &&
      !isNaN(pVacioVal) &&
      pVacioElem.value.trim() !== ""
    ) {
      pVacios.push(pVacioVal);
    }

    let dif = 0;
    if (volElem && pLlenoElem && volElem.value !== "" && pLlenoElem.value !== "") {
      dif = volumen - pLleno;
      if (difInput) difInput.value = dif.toFixed(2);
      totalDif += dif;
      countDif++;
    } else {
      if (difInput) difInput.value = "";
    }
    difs.push(dif);

    if (volElem && volElem.value !== "") {
      totalVol += volumen;
      countVol++;
    }
  }

  const avgVol = countVol > 0 ? totalVol / countVol : 0;
  const avgDif = countDif > 0 ? totalDif / countDif : 0;

  let maxDesv = -Infinity;
  let hasValidDesv = false;

  for (let i = 1; i <= currentSampleCount; i++) {
    const desvInput = document.getElementById(`desv_${i}`);
    const difElem = document.getElementById(`dif_${i}`);
    if (difElem && difElem.value !== "") {
      const desv = Math.abs(avgDif - difs[i - 1]);
      if (desvInput) desvInput.value = desv.toFixed(2);
      if (desv > maxDesv) maxDesv = desv;
      hasValidDesv = true;
    } else {
      if (desvInput) desvInput.value = "";
    }
  }

  const inputMinMax = document.getElementById("input_p_vacio_minmax");
  if (inputMinMax) {
    if (pVacios.length > 0) {
      const minVal = Math.min(...pVacios).toFixed(2);
      const maxVal = Math.max(...pVacios).toFixed(2);
      inputMinMax.value = `${minVal} / ${maxVal}`;
    } else {
      inputMinMax.value = "";
    }
  }

  const resVol = document.getElementById("res_vol_promedio");
  const resDif = document.getElementById("res_dif_promedio");
  const resDesv = document.getElementById("res_desv_maxima");

  if (resVol) resVol.innerText = avgVol.toFixed(2);
  if (resDif) resDif.innerText = avgDif.toFixed(2);
  if (resDesv) {
    resDesv.innerText = hasValidDesv ? maxDesv.toFixed(2) : "0.00";
  }
}

function generateAndPrintReport() {
  // Función auxiliar para leer valor de inputs
  const getValue = (id) => document.getElementById(id)?.value || "";

  document.getElementById("rpt_fecha").innerText = getValue("input_fecha");
  document.getElementById("rpt_cliente").innerText = getValue("input_cliente");
  document.getElementById("rpt_proveedor").innerText = getValue("input_proveedor");
  document.getElementById("rpt_producto").innerText = getValue("input_producto");
  document.getElementById("rpt_presentacion").innerText = getValue("input_presentacion");
  document.getElementById("rpt_cant_botellas").innerText = getValue("input_cant_botellas");
  document.getElementById("rpt_num_paletas").innerText = getValue("input_num_paletas");
  document.getElementById("rpt_densidad").innerText = getValue("input_densidad");
  document.getElementById("rpt_codigo").innerText = getValue("input_codigo");
  document.getElementById("rpt_cod_juliano").innerText = getValue("input_cod_juliano");
  document.getElementById("rpt_lote").innerText = getValue("input_lote");
  document.getElementById("rpt_num_factura").innerText = getValue("input_num_factura");
  document.getElementById("rpt_num_qr").innerText = getValue("input_num_qr");

  const radioChecked = document.querySelector('input[name="tipo_botella"]:checked');
  const tipoBotella = radioChecked ? radioChecked.value : "";
  document.getElementById("rpt_pet_check").innerText = tipoBotella === "PET" ? "[X]" : "[ ]";
  document.getElementById("rpt_vidrio_check").innerText = tipoBotella === "VIDRIO" ? "[X]" : "[ ]";

  const mapCheck = (val, targetC, targetNC) => {
    const elC = document.getElementById(targetC);
    const elNC = document.getElementById(targetNC);
    if (!elC || !elNC) return;

    if (val === "OK") {
      elC.innerText = "X";
      elNC.innerText = "--";
    } else if (val === "NOK") {
      elC.innerText = "--";
      elNC.innerText = "X";
    } else if (val === "NA") {
      elC.innerText = "NA";
      elNC.innerText = "NA";
    } else {
      elC.innerText = "";
      elNC.innerText = "";
    }
  };

  mapCheck(getValue("param_punto_llenado"), "rpt_pj_c", "rpt_pj_nc");
  mapCheck(getValue("param_vidrio_frio"), "rpt_vf_c", "rpt_vf_nc");
  mapCheck(getValue("param_superficie_regular"), "rpt_sr_c", "rpt_sr_nc");
  mapCheck(getValue("param_punto_fragil"), "rpt_pf_c", "rpt_pf_nc");
  mapCheck(getValue("param_dimensiones"), "rpt_dim_c", "rpt_dim_nc");

  // Construir tabla de muestras del reporte
  const rptTbody = document.getElementById("rpt_samples_body");
  if (rptTbody) {
    rptTbody.innerHTML = "";

    const getValueOrDash = (id) => {
      const el = document.getElementById(id);
      const val = el ? el.value.trim() : "";
      return val === "" ? "---" : val;
    };

    for (let i = 1; i <= 13; i++) {
      const isOutOfRange = i > currentSampleCount;
      const tr = document.createElement("tr");

      if (isOutOfRange) {
        tr.innerHTML = `<td>${i}</td>` + '<td class="diagonal-cell"></td>'.repeat(7);
      } else {
        const pVacio = getValueOrDash(`p_vacio_${i}`);
        const pLleno = getValueOrDash(`p_lleno_${i}`);
        const vol = getValueOrDash(`volumen_${i}`);
        const dif = getValueOrDash(`dif_${i}`);
        const desv = getValueOrDash(`desv_${i}`);
        const cavidad = getValueOrDash(`cavidad_${i}`);
        const obs = getValueOrDash(`observacion_${i}`);

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
  }

  const getInnerText = (id) => document.getElementById(id)?.innerText || "";

  document.getElementById("rpt_tot_vol").innerText = getInnerText("res_vol_promedio");
  document.getElementById("rpt_tot_dif").innerText = getInnerText("res_dif_promedio");
  document.getElementById("rpt_tot_desv").innerText = getInnerText("res_desv_maxima");

  document.getElementById("rpt_fp_ref").innerText = getValue("input_fp_ref");
  document.getElementById("rpt_vol_prom_fp").innerText = getInnerText("res_vol_promedio");
  document.getElementById("rpt_desv_max").innerText = getInnerText("res_desv_maxima");
  document.getElementById("rpt_p_vacio_minmax").innerText = getValue("input_p_vacio_minmax");
  document.getElementById("rpt_prof_minmax").innerText = getValue("input_prof_llenado_minmax");
  document.getElementById("rpt_observaciones_gen").innerText = getValue("input_observaciones_gen");

  window.print();
}
(function carameleCalculate () {
        "use strict";

        // --- Referencias a elementos del DOM ---
        const fechaInput = document.getElementById("fecha");
        const colorObtInput = document.getElementById("colorObtenido");
        const colorObjInput = document.getElementById("colorObjetivo");
        const volumenInput = document.getElementById("volumen");
        const k1Input = document.getElementById("k1");
        const k2Input = document.getElementById("k2");
        const resetBtn = document.getElementById("resetConstantes");

        const logObtDisplay = document.getElementById("logObt");
        const logObjDisplay = document.getElementById("logObj");
        const gramosDisplay = document.getElementById("gramosCaramelo");
        const mensajeAdvertencia =
          document.getElementById("mensajeAdvertencia");

        // --- Valores por defecto de las constantes ---
        const DEFAULT_K1 = 0.0023;
        const DEFAULT_K2 = 0.7673;

        // --- Funciones auxiliares ---
        function esNumeroValido(val) {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        }

        // --- Función principal de cálculo ---
        function calcular() {
          // Leer valores
          const colorObt = parseFloat(colorObtInput.value);
          const colorObj = parseFloat(colorObjInput.value);
          const vol = parseFloat(volumenInput.value);
          const k1 = parseFloat(k1Input.value) || 0;
          const k2 = parseFloat(k2Input.value) || 0;

          // Validar entradas para logaritmos (deben ser > 0)
          const colorObtValido = esNumeroValido(colorObt);
          const colorObjValido = esNumeroValido(colorObj);
          const volValido = esNumeroValido(vol);

          // Calcular logs
          let logObt = null;
          let logObj = null;
          let gramos = null;

          if (colorObtValido) {
            logObt = 2 - Math.log10(colorObt);
          }
          if (colorObjValido) {
            logObj = 2 - Math.log10(colorObj);
          }

          // Calcular gramos de caramelo
          if (logObt !== null && logObj !== null && volValido && k2 !== 0) {
            gramos = ((logObj - logObt - k1) / k2) * vol;
          }

          // Redondear
          const gramosDisplay = document.getElementById("gramosCaramelo");
          const gramosRedondeadoSpan =
            document.getElementById("gramosRedondeado");
          const gramosRealSpan = document.getElementById("gramosReal");

          if (gramos !== null) {
            // Redondear al entero más cercano
            const gramosRedondeado = Math.round(gramos);
            const gramosReal = gramos.toFixed(2);

            gramosRedondeadoSpan.textContent = gramosRedondeado;
            gramosRealSpan.textContent = `(${gramosReal})`;
          } else {
            gramosRedondeadoSpan.textContent = "—";
            gramosRealSpan.textContent = "";
          }

          // --- Mostrar resultados ---
          logObtDisplay.textContent = logObt !== null ? logObt.toFixed(4) : "—";
          logObjDisplay.textContent = logObj !== null ? logObj.toFixed(4) : "—";
          gramosDisplay.textContent = gramos !== null ? gramos.toFixed(2) : "—";

          // --- Mostrar/ocultar advertencia ---
          const faltaDatos = !colorObtValido || !colorObjValido || !volValido;
          mensajeAdvertencia.classList.toggle("hidden", !faltaDatos);
        }

        // --- Función para resetear constantes ---
        function resetearConstantes() {
          k1Input.value = DEFAULT_K1;
          k2Input.value = DEFAULT_K2;
          calcular(); // Recalcular con los nuevos valores
        }

        // --- Asignar fecha actual por defecto ---
        function asignarFechaActual() {
          const hoy = new Date();
          const year = hoy.getFullYear();
          const month = String(hoy.getMonth() + 1).padStart(2, "0");
          const day = String(hoy.getDate()).padStart(2, "0");
          fechaInput.value = `${year}-${month}-${day}`;
        }

        // --- Event listeners ---
        // Cada vez que cambie un campo, recalcular
        colorObtInput.addEventListener("input", calcular);
        colorObjInput.addEventListener("input", calcular);
        volumenInput.addEventListener("input", calcular);
        k1Input.addEventListener("input", calcular);
        k2Input.addEventListener("input", calcular);

        // Resetear constantes
        resetBtn.addEventListener("click", resetearConstantes);

        // --- Inicialización ---
        asignarFechaActual();
        calcular();

        // (Opcional) Si se desea que el campo fecha también dispare algo, no es necesario
        // porque no influye en los cálculos, solo es informativo.
      })();
import { AlertCircle, HardHat, Settings, Clock, HelpCircle } from 'lucide-react';

const BASE_SEVERITY = {
    'A': { color: 'bg-red-100 text-red-700 border-red-200', label: 'Externa (A)', icon: AlertCircle, desc: 'Requiere gestión con terceros' },
    'B': { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Interna (B)', icon: HardHat, desc: 'Gestión operativa de la AFP' },
    'S': { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Sistema (S)', icon: Settings, desc: 'Error técnico/lógico' },
    'W': { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Espera (W)', icon: Clock, desc: 'En proceso automático' },
    'MIXTA': { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Mixta', icon: HelpCircle, desc: 'Requiere revisión manual' }
};

export const SEVERITY_CONFIG = {
    ...BASE_SEVERITY,
    'Externa (A)': BASE_SEVERITY['A'],
    'Interna (B)': BASE_SEVERITY['B'],
    'Sistema (S)': BASE_SEVERITY['S'],
    'Espera (W)': BASE_SEVERITY['W'],
    // Also handle lowercase if needed based on user's comment
    'externa (A)': BASE_SEVERITY['A'],
    'interna (B)': BASE_SEVERITY['B'],
    'sistema (S)': BASE_SEVERITY['S'],
    'espera (W)': BASE_SEVERITY['W'],
};

export const SIAFP_RESPUESTAS = {
    "086": {
        significado: "Aporte ya registrado como pagado (posible duplicado)",
        accion: "Revisar sistema interno. No enviar Novedad 004.",
        severidad: "S",
        template: null
    },
    "023": {
        significado: "Conflicto de identidad: Mismo número, diferente tipo doc",
        accion: "Validar error digitación. Corregir y enviar Nov 127.",
        severidad: "B",
        template: null
    },
    "077": {
        significado: "Inconsistencia entre nombres reportados y certificados",
        accion: "Analizar coincidencia. Corregir y enviar Nov 127.",
        severidad: "B",
        template: null
    },
    "074": {
        significado: "Excluido RPM por edad",
        accion: "Devolución de aportes y anular (Nov 127).",
        severidad: "B",
        template: null
    },
    "075": {
        significado: "Excluido RAIS por edad",
        accion: "Devolución de aportes y anular (Nov 127).",
        severidad: "B",
        template: null
    },
    "079": {
        significado: "Excluido por aporte independiente sin vinculación",
        accion: "Devolución de aportes y anular (Nov 127).",
        severidad: "B",
        template: null
    },
    "076": {
        significado: "Fecha de pago posterior al fallecimiento",
        accion: "Devolución de aportes y anular (Nov 127).",
        severidad: "B",
        template: null
    },
    "011": {
        significado: "Afiliado no existe en BD SIAFP ni Entidad Certificadora",
        accion: "Verificar internamente. Esperar notificación.",
        severidad: "A",
        template: {
            subject: "Requerimiento Validación Afiliado - Error SIAFP 011",
            body: "Estimados,\n\nSe ha detectado en nuestro sistema de validación que el afiliado no existe en la base de datos de SIAFP ni en la Entidad Certificadora (Error 011).\n\nLe solicitamos amablemente verificar internamente el estado de afiliación y quedar a la espera de la notificación oficial de vinculación para proceder con el procesamiento del aporte."
        }
    },
    "081": {
        significado: "ID no existe en Registraduría ni SIAFP",
        accion: "Verificar digitación. Contactar aportante.",
        severidad: "A",
        template: {
            subject: "Inconsistencia en Identificación - Error SIAFP 081",
            body: "Estimado Aportante,\n\nHemos detectado que el número de identificación reportado no se encuentra registrado en la base de datos de la Registraduría Nacional ni en SIAFP (Error 081).\n\nPor favor, verifique la digitación del documento y confírmenos los datos correctos a la mayor brevedad posible para regularizar el estado del aporte."
        }
    },
    "022": {
        significado: "Afiliado cambió de documento",
        accion: "Actualizar BD interna y enviar Nov 127.",
        severidad: "B",
        template: null
    },
    "117": {
        significado: "Aporte corresponde a la AFP (Auto-match)",
        accion: "Verificar apertura cuenta, acreditar y anular rezago.",
        severidad: "B",
        template: null
    },
    "227": {
        significado: "Inconsistencias historial vinculaciones",
        accion: "Esperar reconstrucción historial (Tarea 072).",
        severidad: "W",
        template: null
    },
    "021": {
        significado: "Afiliado no vigente en ninguna AFP",
        accion: "Esperar notificación vínculo.",
        severidad: "W",
        template: null
    },
    "231": {
        significado: "Posible OERPM (Régimen Prima Media)",
        accion: "Validar entidad y gestionar traslado.",
        severidad: "A",
        template: {
            subject: "Gestión de Traslado OERPM - Error SIAFP 231",
            body: "Estimados,\n\nSe ha identificado un posible caso de OERPM (Régimen de Prima Media) para el afiliado en cuestión (Error 231).\n\nAgradecemos validar con la entidad correspondiente y, de ser procedente, gestionar el traslado de los recursos para dar cumplimiento a la normativa vigente."
        }
    },
    "128": {
        significado: "Periodo con mora (Cálculo Actuarial)",
        accion: "Gestionar pago cálculo actuarial.",
        severidad: "A",
        template: {
            subject: "Gestión Pago Cálculo Actuarial - Error SIAFP 128",
            body: "Estimados,\n\nSe ha detectado un periodo con mora que requiere la generación de un cálculo actuarial para su correcta acreditación (Error 128).\n\nEs necesario gestionar el pago del cálculo actuarial correspondiente para regularizar la situación pensional del afiliado."
        }
    },
    "129": {
        significado: "Empleador sin clase de aportante",
        accion: "Actualizar clase aportante (ASEMPOMISOSNV).",
        severidad: "B",
        template: null
    },
    "226": {
        significado: "Indicio afiliación otra entidad RPM",
        accion: "Verificar estatus pensionado.",
        severidad: "A",
        template: {
            subject: "Verificación Estatus Pensionado - Error SIAFP 226",
            body: "Estimados,\n\nExiste un indicio de afiliación en una entidad del Régimen de Prima Media para este afiliado (Error 226).\n\nSolicitamos verificar el estatus pensional del afiliado en las bases de datos externas para determinar la procedencia del aporte reportado."
        }
    },
    "009": {
        significado: "Aporte identificado otra entidad",
        accion: "Pagar a entidad indicada.",
        severidad: "B",
        template: null
    },
    "887": {
        significado: "En proceso reconstrucción historial",
        accion: "Esperar conclusión proceso.",
        severidad: "W",
        template: null
    },
    "889": {
        significado: "En proceso modificación ID",
        accion: "Esperar conclusión trámite.",
        severidad: "W",
        template: null
    },
    "335": {
        significado: "Inconsistencia Colpensiones vs SIAFP",
        accion: "Esperar resolución.",
        severidad: "W",
        template: null
    },
    "886": {
        significado: "Falla conexión Colpensiones",
        accion: "Esperar restablecimiento.",
        severidad: "W",
        template: null
    },
    "900": {
        significado: "Pendiente confirmar anulación/retracto",
        accion: "Verificar Novedad 165.",
        severidad: "A",
        template: {
            subject: "Confirmación Anulación/Retracto - Error SIAFP 900",
            body: "Estimados,\n\nEl registro se encuentra en estado pendiente de confirmar anulación o retracto (Error 900).\n\nSe requiere verificar la Novedad 165 en el sistema para confirmar el estado final de este movimiento y proceder con la gestión contable."
        }
    },
    "093": {
        significado: "Nombres no coinciden (Requiere Tarea)",
        accion: "Ver sub-caso",
        severidad: "MIXTA",
        template: null
    }
};

const moment = require('moment');

class DateHelper {
    static getTodayDate() {
        return {
            today: new Date().toISOString().split("T")[0] //Fecha en formato aaaa-dd-mm
        }
    }
    /**
     * Obtiene los timestamps en milisegundos UNIX para hoy desde las 00:00 hasta ahora.
     */
    static getToday() {
        return {
            startTimeMillis: moment().startOf('day').valueOf(), // Hoy a las 00:00:00
            endTimeMillis: moment().valueOf() // Ahora mismo
        };
    }

    /**
     * Obtiene los timestamps en milisegundos UNIX para ayer desde las 00:00 hasta las 23:59.
     */
    static getYesterday() {
        return {
            startTimeMillis: moment().subtract(1, 'days').startOf('day').valueOf(), // Ayer 00:00:00
            endTimeMillis: moment().subtract(1, 'days').endOf('day').valueOf() // Ayer 23:59:59
        };
    }

    /**
     * Obtiene los timestamps en milisegundos UNIX para la última semana (desde el último lunes hasta ahora).
     */
    static getLastWeek() {
        return {
            startTimeMillis: moment().startOf('isoWeek').valueOf(), // Último lunes a las 00:00:00
            endTimeMillis: moment().valueOf() // Ahora mismo
        };
    }

    /**
     * Obtiene los timestamps en milisegundos UNIX desde el primer día del mes hasta ahora.
     */
    static getStartOfMonth() {
        return {
            startTimeMillis: moment().startOf('month').valueOf(), // Día 1 del mes a las 00:00:00
            endTimeMillis: moment().valueOf() // Ahora mismo
        };
    }
}

module.exports = DateHelper;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableTimeSlots = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function getAvailableTimeSlots({ doctorId, date }) {
    var _a;
    try {
        const response = await axios_1.default.post(`${process.env.API_URL}/patient/available-slots`, {
            doctorId,
            date,
        });
        return response.data.availableSlots;
    }
    catch (err) {
        console.error("🛑 Slot API error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        return [];
    }
}
exports.getAvailableTimeSlots = getAvailableTimeSlots;

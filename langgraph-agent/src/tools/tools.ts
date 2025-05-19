import axios from "axios"
import {config} from "dotenv"

config()

type SlotInput = {
  doctorId: string;
  date: string; // YYYY-MM-DD
};

export async function getAvailableTimeSlots({ doctorId, date }: SlotInput) {
  try {
    const response = await axios.post(
      `${process.env.API_URL}/patient/available-slots`,
      {
        doctorId,
        date,
      }
    );

    return response.data.availableSlots;
  } catch (err: any) {
    console.error("🛑 Slot API error:", err.response?.data || err.message);
    return [];
  }
}

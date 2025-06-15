require("dotenv").config();
const cron = require("node-cron");
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// 📞 Функция вызова с возможностью повтора
async function makeCall(attempt = 1) {
  console.log(`☎️ Попытка #${attempt}: делаем звонок...`);

  try {
    const call = await client.calls.create({
      twiml: '<Response><Say>Wake up! This is your wake-up bot calling you.</Say></Response>',
      to: process.env.YOUR_PHONE,
      from: process.env.TWILIO_PHONE,
    });

    console.log(`📞 Вызов отправлен: ${call.sid}`);

    // Ждём 30 секунд, чтобы дать звонку пройти
    await new Promise((res) => setTimeout(res, 30000));

    const result = await client.calls(call.sid).fetch();
    console.log(`📊 Статус звонка: ${result.status}`);

    if (["no-answer", "busy", "failed"].includes(result.status) && attempt < 2) {
      console.log("🔁 Повторный звонок через 1 минуту...");
      setTimeout(() => makeCall(attempt + 1), 60_000);
    } else {
      console.log("✅ Звонок завершён. Повтор не требуется.");
    }
  } catch (err) {
    console.error("❌ Ошибка при звонке:", err);
  }
}

// 🧪 Тестовый звонок при запуске
makeCall();

// ⏱ Просто проверка, что скрипт жив
cron.schedule("* * * * *", () => {
  console.log("⏱ Планировщик работает:", new Date().toLocaleTimeString());
});

// 🕞 Будильник: звонок в 3:30 AM каждый день
cron.schedule("30 3 * * *", () => {
  console.log("⏰ 3:30 AM! Wake-up вызов стартует.");
  makeCall();
});

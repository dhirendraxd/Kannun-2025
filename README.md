# 🎓 AI-Powered University Recommendation Web App

## 🏆 **3rd Prize Winner - KIST Hackfest 2025**
Recognized for innovation in education technology at the KIST Hackfest 2025 competition.

---

## 📌 Overview

This web app helps students find the **best universities and courses** based on their profile and documents.
The AI **only recommends universities listed in our database** (stored in Supabase) — it never pulls random results from the internet.

**For Students:**

* Upload academic documents (degrees, CV, IELTS scores, etc.)
* Set preferences (location, fees range, program type)
* Get **AI-generated recommendations** from universities listed on our platform only

**For Universities:**

* Post course offerings, intake dates, fees, scholarships, and other perks
* Reach interested students directly through the platform

---



## 🚀 Features

### Student Login

* Upload academic and supporting documents
* Set preferred location, course type, and budget
* Get AI recommendations from **our listed universities only**

### University Login

* Add and manage university listings
* Upload details about courses, fees, intake dates, and scholarships

### AI Recommendation Engine

* Reads student profile & preferences
* Filters universities from **Supabase DB only**
* Suggests the **top matches** with explanations
* Never invents fake universities or data

---

## ⚡ How It Works

1. **Student Profile Creation**
   Student uploads documents and enters preferences.

2. **Database Query**
   Backend queries **Supabase** for matching universities based on filters (location, fees, course type).

3. **AI Processing**
   Gemini API is given **only the filtered university data** and the student profile.

   * AI ranks the best matches
   * AI outputs a clear recommendation list

4. **Output Display**
   Recommendations are shown in a clean, modern UI with university details.

---

## 🔒 Preventing AI Hallucinations

We ensure accuracy by:

* **Not** letting AI search online
* Only feeding AI the data retrieved from Supabase
* Adding explicit rules in the prompt:

  > "Recommend ONLY from the provided list. If no match is found, say 'No suitable match found.'"

---

---

## 📡 Example AI Call

```javascript
const prompt = `
You are an AI assistant that recommends universities ONLY from the provided list.

Student details:
${JSON.stringify(studentProfile)}

Available universities:
${JSON.stringify(universities)}

Rules:
- Recommend ONLY from the list
- If no match, reply "No suitable match found"
`;

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const result = await model.generateContent(prompt);
console.log(result.response.text());
```

---

## 🏆 Hackathon Theme Alignment

**Theme:** *Reimagining Education: Accessible, Engaging & Future-Ready Learning*
This project empowers students to make informed decisions, connects them directly with universities, and leverages AI to simplify the complex process of higher education selection.



# Allerfree

**Allerfree makes dining out with allergies a piece of cake.**

## Product vision
Allerfree is built for people with food allergies (and anyone dining with them) who want a faster way to decide where to eat. As a Chrome extension on Google Maps, it analyzes a restaurant’s menu photos and highlights potential allergens using your saved profiles, without requiring you to copy links or upload images elsewhere.

## How it works
1. Open a restaurant on Google Maps and click the **Menu** tab (the one with menu images).  
2. Click **“Can I Eat Here?”** on the menu page.

<img width="320" alt="Google Maps Menu tab showing the Allerfree “Can I Eat Here?” button next to menu images." src="https://github.com/user-attachments/assets/b8906781-001a-4be4-9b63-86fd2855bfc3" />

3. Choose **Analyze All Profiles** or **select multiple profiles** to analyze.

<img width="320" alt="Allerfree profile selection screen with checkboxes and an “Analyze All” button." src="https://github.com/user-attachments/assets/0b85dfd2-a759-4e58-b713-b541f6ab4acf" />

4. Wait while Allerfree analyzes the restaurant’s menu photos.

<table>
  <tr>
    <td align="center" width="50%">
      <img width="260" alt="Analysis status banner showing loading in progress." src="https://github.com/user-attachments/assets/0d4f3cea-763f-49f2-8e37-e926c7611fec" />
      <br />
      <sub>Analyzing</sub>
    </td>
    <td align="center" width="50%">
      <img width="260" alt="Analysis status banner showing completion with a green checkmark." src="https://github.com/user-attachments/assets/911ddd71-acb4-4662-9458-a2efd2171db1" />
      <br />
      <sub>Done</sub>
    </td>
  </tr>
</table>

5. Review the results and decide where to eat.

<table>
  <tr>
    <td align="center" width="50%">
      <img width="280" alt="Results screen showing an item marked SAFE." src="https://github.com/user-attachments/assets/bb990482-3867-4f65-bdb8-d6932508335e" />
      <br />
      <sub>SAFE example</sub>
    </td>
    <td align="center" width="50%">
      <img width="280" alt="Results screen showing an item marked AVOID." src="https://github.com/user-attachments/assets/c129dbcb-f45a-4f88-ad28-bae65f70e025" />
      <br />
      <sub>AVOID example</sub>
    </td>
  </tr>
</table>

## Supported allergies
Allerfree currently supports:
- Gluten  
- Tree nuts  
- Shellfish  
  <img width="402" height="250" alt="Select: Gluten, Tree nuts or Shellfish" src="https://github.com/user-attachments/assets/8a264454-ef55-4ca9-b622-61a8d443ffa1" />


## High-level flow
1. The Chrome extension reads the restaurant context and menu images from the Google Maps page.  
2. An API gateway formats and validates the request, applies caching, and forwards it to the model service.  
3. The model service runs OCR + analysis to structure the menu and flag likely allergens.  
4. The extension displays results per selected profile (SAFE vs AVOID) with a short explanation.

## Technologies used
- **Chrome extension:** React, TypeScript, JavaScript, Vite, Chrome Extension APIs (MV3)  
- **Backend:** Spring Boot (API gateway), MongoDB (caching)  
- **Model service:** FastAPI (Python), Google Cloud Vision (OCR), Gemini (menu structuring + allergen detection)  
- **Deployment:** Docker + Docker Compose (hosted on DigitalOcean)  

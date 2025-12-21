# Allerfree

**Allerfree makes dining out with allergies a piece of cake.**

Allerfree is a Chrome extension that analyzes a restaurant’s menu photos **directly on Google Maps** and flags dishes that could trigger your allergies.

## How it works
1. Open a restaurant on Google Maps and click the **Menu** tab (the one with menu images).  

2. Click **“Can I Eat Here?”**, then choose **Analyze All Profiles** or **select multiple profiles** to analyze.

<table>
  <tr>
    <td align="center" width="50%">
      <img width="346" alt="Google Maps Menu tab showing the Allerfree “Can I Eat Here?” button next to menu images." src="https://github.com/user-attachments/assets/b8906781-001a-4be4-9b63-86fd2855bfc3" />
      <br />
      <sub>Google Maps Menu Tab</sub>
    </td>
    <td align="center" width="50%">
      <img width="346" alt="Allerfree analysis screen where you can select multiple profiles or choose Analyze All." src="https://github.com/user-attachments/assets/0b85dfd2-a759-4e58-b713-b541f6ab4acf" />
      <br />
      <sub>Start Analysis</sub>
    </td>
  </tr>
</table>

3. Wait while Allerfree analyzes the restaurant’s menu photos.

<table>
  <tr>
    <td align="center" width="50%">
      <img width="346" alt="Analysis status banner showing loading in progress." src="https://github.com/user-attachments/assets/0d4f3cea-763f-49f2-8e37-e926c7611fec" />
      <br />
      <sub>Analyzing</sub>
    </td>
    <td align="center" width="50%">
      <img width="346" alt="Analysis status banner showing completion with a green checkmark." src="https://github.com/user-attachments/assets/911ddd71-acb4-4662-9458-a2efd2171db1" />
      <br />
      <sub>Done</sub>
    </td>
  </tr>
</table>

4. Review the results and decide where to eat.

<table>
  <tr>
    <td align="center" width="50%">
      <img width="346" alt="Results screen showing an item marked SAFE." src="https://github.com/user-attachments/assets/4238e4c5-2b0d-4bc9-889e-af825180e9f5" />
      <br />
      <sub>SAFE example</sub>
    </td>
    <td align="center" width="50%">
      <img width="346" alt="Results screen showing an item marked AVOID." src="https://github.com/user-attachments/assets/c6b01f54-a2ae-43c1-8041-13cb420827a6" />
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
<img width="360" alt="Allergen selection showing gluten, tree nuts, and shellfish." src="https://github.com/user-attachments/assets/8a264454-ef55-4ca9-b622-61a8d443ffa1" />

## High-level flow
1. The extension reads restaurant context and menu images from Google Maps.  
2. The backend validates the request, applies caching, and forwards it to the model service.  
3. The model service runs OCR + analysis to flag likely allergens.  
4. Results are shown per selected profile with a short explanation.

## Technologies used
**Chrome extension**
- React + TypeScript (popup UI)
- JavaScript + Chrome Extension APIs (content scripts on Google Maps)
- `chrome.storage` for syncing profiles and analysis jobs

**Backend + model**
- Spring Boot (API gateway), MongoDB Atlas (caching)
- FastAPI (Python), Google Cloud Vision (OCR), Gemini (analysis)

## CI/CD + deployment
We use GitHub Actions to build and release the Chrome extension, and to deploy backend services in a repeatable way.

**How it works**
- The extension is built and packaged into a zip, with the **API base URL injected at build time** via GitHub Variables, then published through GitHub Releases.  
- Backend services are shipped as Docker images and deployed together using Docker Compose on the deployment host.

**Links**
- Releases: [RELEASES](https://github.com/sookiemonster/allerfree/releases)  
- Deployments: [DEPLOYMENTS](https://github.com/sookiemonster/allerfree/deployments)  

## Ethical considerations
- **No mass scraping**: analysis is user-driven and only runs when someone is actively viewing a restaurant on Google Maps.  
- **Safety-first output**: results are guidance, not a guarantee. Allerfree is designed to be conservative when uncertainty exists.  

## Team
- [**Daniel**](https://github.com/sookiemonster): Product owner, system architecture, ML engineering, backend deployment  
- [**Thomas**](https://github.com/thomasyu21): Spring Boot API, request/response adaptation, MongoDB Atlas caching, JWT security  
- [**Kyle**](https://github.com/KymaiselHunter): Extension logic, content script integration, API communication, storage and job orchestration 
- [**Kelly**](https://github.com/Kxlcl): UI/UX design and popup experience, presentation materials  

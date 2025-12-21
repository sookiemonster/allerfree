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
**Frontend (Chrome extension)**
- React + TypeScript (popup UI)
- JavaScript content scripts injected into Google Maps
- Persistent storage via `chrome.storage` to keep profiles and job state synced

**Backend (API Gateway)**
- Spring Boot
- Spring WebFlux + Spring Security
- MongoDB Atlas for caching

**Model service**
- Python + FastAPI
- Google Cloud Vision for OCR
- Gemini for menu structuring and allergen detection

## Frontend CI/CD (Chrome extension)

We use a GitHub Actions workflow to continuously build and package the Chrome extension, then publish it through GitHub Releases.

**Why we do this**
- Keeps releases **reproducible** and easy to install for testers and reviewers  
- Avoids hardcoding environments by injecting the **API base URL** at build time  

**How it works**
1. GitHub Actions installs dependencies and builds the extension.
2. During the build, a config file is generated so the content scripts know which backend API to call (API base URL is provided via GitHub Variables).
3. The built extension (`dist/`) is zipped and uploaded as a GitHub Release artifact.

**Link**
- GitHub Releases: [RELEASES](https://github.com/sookiemonster/allerfree/releases)

## Backend CI/CD + deployment (API gateway + model service)

We deploy the backend as containerized services so the API gateway and model service run consistently in production.

**Why we do this**
- Docker provides a **consistent runtime** across machines  
- Docker Compose deploys the full stack together (API gateway + model service)  

**How it works**
1. GitHub Actions builds Docker images for the API gateway and model service and publishes them to a container registry.
2. The deployment host pulls the latest images and restarts the Docker Compose stack to apply updates.

**Link**
- Deployments page: [DEPLOYMENTS](https://github.com/sookiemonster/allerfree/deployments)

## Ethical considerations
- **No mass scraping**: analysis is user-driven and only runs when someone is actively viewing a restaurant on Google Maps.  
- **Safety-first output**: results are guidance, not a guarantee. Allerfree is designed to be conservative when uncertainty exists.  

## Team
- [**Daniel**](https://github.com/sookiemonster): Product owner, system architecture, ML engineering, backend deployment  
- [**Thomas**](https://github.com/thomasyu21): Spring Boot API, request/response adaptation, MongoDB Atlas caching, backend deployment  
- [**Kyle**](https://github.com/KymaiselHunter): Extension logic, async job orchestration, multi-tab synchronization, API communication  
- [**Kelly**](https://github.com/Kxlcl): UI/UX for profiles and analysis flow, results interactions, on-page job rendering  


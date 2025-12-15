package com.allerfree.AllerFree.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuSection {
    private String sectionName;
    private String description;
    private List<MenuItem> items;

    public void addMenuItem(MenuItem item, Allergy[] allergies){
        List<AllergenPrediction> personalizedContains = new ArrayList<AllergenPrediction>();
        
        //Create copy with all same except empty contains list
        MenuItem copy = new MenuItem(item.getName(), item.getDescription(), item.getSymbols(), personalizedContains);

        for (AllergenPrediction pred : item.getContains()){
            //Check if allergy is in the list of provided allergies
            for (Allergy allergy : allergies){

                if (pred.getAllergen().equals(allergy.getAllergen())){
                    AllergenPrediction predCopy = new AllergenPrediction(pred.getAllergen(), pred.getPrediction(), pred.getExplanation(), true);
                    if (pred.getPrediction().equals("VERY_LIKELY") || (pred.getPrediction().equals("MAY_CONTAIN") && allergy.getSensitivity().equals("HIGH"))){ //Adjust depending on sensitivity (MAY_CONTAIN to VERY_LIKELY if sensitivity is HIGH)
                        predCopy.setSafe_to_eat(false);
                    }
                    personalizedContains.add(predCopy); //Add AllergenPrediction to MenuItem
                    
                    break;
                }
            }
        }

        copy.setContains(personalizedContains);
        items.add(copy);
    }
}

package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

<<<<<<< HEAD
import java.util.HashMap;
=======
>>>>>>> master
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AllergenDetection {
    private List<Image> images;
<<<<<<< HEAD
    private HashMap<String, Profile> profiles;
=======
    private Profile[] profiles;
>>>>>>> master
}

package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

<<<<<<< HEAD
=======
import java.util.List;
>>>>>>> master
import java.util.HashMap;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuResponse {
<<<<<<< HEAD
=======
    private List<Integer> successful;
>>>>>>> master
    private HashMap<Integer, String> failed;
    private HashMap<String, MenuOutput> results;
}

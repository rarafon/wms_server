package com.wms.wms_server.controllers;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;

import com.wms.wms_server.model.items.ItemCategory;
import com.wms.wms_server.model.response.ItemCategoryResponse;
import com.wms.wms_server.repository.ItemCategoryRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.DateFormat;
import java.util.*;


@Controller
public class ItemCategoryController {
    @Autowired
    ItemCategoryRepository itemCategoryRepository;

    @GetMapping(value="/view_categories")
    public String view_categories() {
        return "category/view_categories";
    }

    public ItemCategoryResponse convert_to_response(ItemCategory category) {
        return convert_to_response(category, DateFormat.getDateInstance());
    }

    public ItemCategoryResponse convert_to_response(ItemCategory category, DateFormat dateFormat) {
        return new ItemCategoryResponse(
            category.getId(), category.getName(), 
            dateFormat.format(category.getCreatedDate()), 
            dateFormat.format(category.getLastModifiedDate()));
    }
    
    @GetMapping(value="/categories")
    @ResponseBody
    public List<ItemCategoryResponse> get_categories() {
        List<ItemCategoryResponse> responses = new ArrayList<>();
        DateFormat dateFormat = DateFormat.getDateTimeInstance();
        for (ItemCategory category : itemCategoryRepository.findAll()) {
            responses.add(convert_to_response(category, dateFormat));
        }
        return responses;
    }

    @RequestMapping(path="/categories/{itemCategory_id}",
        produces="application/json", method=RequestMethod.PATCH)
    @ResponseBody
    public ItemCategoryResponse edit_category(
        @PathVariable("itemCategory_id") Long itemCategory_id, 
        HttpServletRequest request) 
    {
        if (request.getParameter("name") == null || request.getParameter("name").length() == 0) {
            return null;
        }
        Optional<ItemCategory> oIC = itemCategoryRepository.findById(itemCategory_id);
        if (oIC.isPresent()) {
            ItemCategory itemCategory = oIC.get();
            itemCategory.setName(request.getParameter("name"));
            itemCategoryRepository.save(itemCategory);
            return convert_to_response(itemCategory);
        }
        return null;
    }
}

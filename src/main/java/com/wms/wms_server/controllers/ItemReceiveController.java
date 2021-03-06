package com.wms.wms_server.controllers;

import javax.servlet.http.HttpServletRequest;

import com.wms.wms_server.model.items.ItemReceive;
import com.wms.wms_server.model.response.items.ItemReceiveResponse;
import com.wms.wms_server.repository.items.ItemReceiveRepository;
import com.wms.wms_server.services.items.ItemReceiveService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Controller
public class ItemReceiveController {
    @Autowired
    ItemReceiveRepository itemReceiveRepository;
    @Autowired 
    ItemReceiveService itemReceiveService;

    @GetMapping(value = "receive_items")
    public String view_receiving_items() {
        return "items/receive_items";
    }

    @GetMapping(value = "view_item_receive")
    public String view_item_receive() {
        return "items/view_item_receive";
    }

    @RequestMapping(path="/itemreceive", produces="application/json;", 
        method=RequestMethod.GET)
    @ResponseBody
    public List<ItemReceiveResponse> get_itemreceive(
            @RequestParam(required = false) String property, 
            @RequestParam(required = false) String value,
            @RequestParam(required = false) String value2) {
        List<ItemReceiveResponse> responses = new ArrayList<>();
        if (property == null || value == null) {
            for (ItemReceive item : itemReceiveRepository.findAll()) {
                ItemReceiveResponse response = itemReceiveService.convert_to_response(item);
                responses.add(response);
            }
        } else {
            for (ItemReceive item : itemReceiveService.searchItemReceive(property, value, value2)) {
                ItemReceiveResponse response = itemReceiveService.convert_to_response(item);
                responses.add(response);
            }
        }
        
        return responses;
    }

    @RequestMapping(path="/itemreceive", produces="application/json;", 
        method=RequestMethod.POST)
    @ResponseBody
    public ItemReceiveResponse create_itemReceive(HttpServletRequest request) {
        ItemReceive itemReceive = itemReceiveService.create_itemReceive(request);
        if (itemReceive == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "ItemReceive not found"
            );
        }
        return itemReceiveService.convert_to_response(itemReceive);
    }

    @RequestMapping(path="/itemreceive/{itemReceiveId}", produces="text/plain;", 
        method=RequestMethod.DELETE)
    @ResponseBody
    public String delete_itemReceive(@PathVariable("itemReceiveId") Long itemReceiveId) {
        try {
            itemReceiveRepository.deleteById(itemReceiveId);
            return "OK";
        } catch(Exception e) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "ItemReceive not found"
            );
        }
    }
}
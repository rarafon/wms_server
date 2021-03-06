package com.wms.wms_server.controllers.items;

import javax.servlet.http.HttpServletRequest;

import com.wms.wms_server.model.items.ItemInfo;
import com.wms.wms_server.model.response.items.ItemInfoResponse;
import com.wms.wms_server.repository.items.ItemInfoRepository;
import com.wms.wms_server.services.ItemInfoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

@Controller
public class ItemInfoAndBarcodeController {
    @Autowired
    ItemInfoRepository itemInfoRepository;
    
    @Autowired
    ItemInfoService itemInfoService;

    @GetMapping("/view_item_info")
    public String view_item_info() {
        return "items/view_item_info";
    }

    @RequestMapping(path="/iteminfo", produces="application/json;", method=RequestMethod.POST)
    @ResponseBody
    public ResponseEntity createItemInfo(HttpServletRequest request) {
        ItemInfo itemInfo = itemInfoService.createItemInfo(request);
        if (itemInfo == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("CONFLICT");
        }
        return ResponseEntity.status(HttpStatus.OK).body(
            itemInfoService.convert_to_response( itemInfo ));
    }

    @RequestMapping(path="/iteminfo", produces="application/json;", method=RequestMethod.GET)
    @ResponseBody
    public List<ItemInfoResponse> search_itemInfos(
      @RequestParam(required = false) String type, 
      @RequestParam(required = false) String value) {
        if (type == null || value == null) {
            return itemInfoService.convert_list_to_responses(itemInfoRepository.findAll());
        }
        List<ItemInfo> items = itemInfoService.search_itemInfo(type, value);
        return itemInfoService.convert_list_to_responses(items);
    }

    @RequestMapping(path="/iteminfo/{iteminfo_id}", produces="text/plain;", method=RequestMethod.DELETE)
    @ResponseBody
    public String delete_itemInfo(@PathVariable("iteminfo_id") Long iteminfo_id) {
        itemInfoRepository.deleteById(iteminfo_id);
        return "OK";
    }

    @RequestMapping(path="/iteminfo/{iteminfo_id}", produces="application/json;", method=RequestMethod.PATCH)
    @ResponseBody
    public ItemInfoResponse edit_itemInfo(@PathVariable("iteminfo_id") Long iteminfo_id,
            HttpServletRequest request) {
        ItemInfo itemInfo = itemInfoService.edit_itemInfo(iteminfo_id, request);

        return itemInfoService.convert_to_response(itemInfo);
    }
    
    @RequestMapping(path="/iteminfo/{iteminfo_id}/itemskus", 
        produces="application/json;", method=RequestMethod.POST)
    @ResponseBody
    public Map<String, String> create_barcode(
            @PathVariable("iteminfo_id") Long iteminfo_id,
            HttpServletRequest request) {
        return itemInfoService.convert_itemSku_to_obj(
            itemInfoService.add_barcode(iteminfo_id, request.getParameter("sku"))
        );
    }

    @RequestMapping(path="/iteminfo/{iteminfo_id}/itemskus/{itemsku_id}", 
        produces="text/plain;", method=RequestMethod.DELETE)
    @ResponseBody
    public String delete_barcode(
            @PathVariable("iteminfo_id") Long iteminfo_id,
            @PathVariable("itemsku_id") Long itemsku_id) 
    {
        itemInfoService.delete_itemSku(iteminfo_id, itemsku_id);
        return "OK";
    }
}
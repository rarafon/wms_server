package com.wms.wms_server.services;

import com.wms.wms_server.model.items.ItemCategory;
import com.wms.wms_server.model.items.ItemInfo;
import com.wms.wms_server.model.items.ItemSku;
import com.wms.wms_server.model.response.items.ItemInfoResponse;
import com.wms.wms_server.repository.items.ItemCategoryRepository;
import com.wms.wms_server.repository.items.ItemInfoRepository;
import com.wms.wms_server.repository.items.ItemSkuRepository;
import com.wms.wms_server.services.items.ItemSkuService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;
import org.hibernate.exception.ConstraintViolationException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;;

@Service
public class ItemInfoService {
    @Autowired
    ItemInfoRepository itemInfoRepository;
    @Autowired
    ItemSkuRepository itemSkuRepository;
    @Autowired
    ItemCategoryRepository itemCategoryRepository;

    @Autowired
    ItemSkuService itemSkuService;

    public ItemInfo createItemInfo(HttpServletRequest request) {
        try {
            if (request.getParameter("name") == null ||
                request.getParameter("description") == null ||
                request.getParameter("weight") == null) {
                return null;
            }
            ItemInfo.Builder builder = new ItemInfo.Builder(
                request.getParameter("name"),
                request.getParameter("description"),
                Float.parseFloat(request.getParameter("weight"))
                );
            if (request.getParameter("height") != null && 
                    request.getParameter("height").length() > 0 &&
                    request.getParameter("width") != null &&
                    request.getParameter("width").length() > 0 &&
                    request.getParameter("length") != null &&
                    request.getParameter("length").length() > 0) {
                builder.height(Integer.parseInt(request.getParameter("height")));
                builder.width(Integer.parseInt(request.getParameter("width")));
                builder.length(Integer.parseInt(request.getParameter("length")));
            }
            if (request.getParameter("itemCategory") != null &&
                    request.getParameter("itemCategory").length() > 0) {
                Optional<ItemCategory> oItemCategory = 
                    itemCategoryRepository.findById(Long.parseLong(request.getParameter("itemCategory")));
                if (oItemCategory.isPresent()) {
                    builder.itemCategory(oItemCategory.get());
                }
            }

            ItemInfo itemInfo = builder.build();
            itemInfoRepository.save(itemInfo);
            // Create ItemSku if it sku was provided
            String itemSku = request.getParameter("itemSku");
            if (itemSku != null && itemSku.length() > 0 && 
              !itemSkuService.checkIfSkuExists(itemSku)) {
                itemSkuService.createItemSku(itemSku, itemInfo);
            }
            return itemInfo;
        } catch(ConstraintViolationException | DataIntegrityViolationException e) {
            System.out.println("ERROREROERAR");
            System.out.println(e.getMessage());
            return null;
        } catch(Exception e) {
            System.out.println(e);
            return null;
        }
        
    }

    public List<ItemInfo> search_itemInfo(String type, String value) {
        if (type.equals("name")) {
            return itemInfoRepository.findByItemNameContainingIgnoreCase(value);
        } else if (type.equals("description")) {
            return itemInfoRepository.findByDescriptionContainingIgnoreCase(value);
        } else if (type.equals("sku")) {
            HashSet<String> ids = new HashSet<>();
            ItemInfo item;
            List<ItemInfo> items = new ArrayList<>();
            for (ItemSku sku : itemSkuRepository.findBySkuContainingIgnoreCase(value)) {
                item = sku.getItemInfo();
                if (!ids.contains(Long.toString(item.getId()))) {
                    ids.add(Long.toString(item.getId()));
                    items.add(item);
                }
            }
            return items;
        } else if (type.equals("category")) {
            List<ItemInfo> items = new ArrayList<>();
            for (ItemInfo item : itemInfoRepository.findByItemCategoryName(value)) {
                items.add(item);
            }
            return items;
        } else {
            return new ArrayList<>();
        }
    }

    public List<ItemInfoResponse> convert_list_to_responses(List<ItemInfo> items) {
        List<ItemInfoResponse> l = new ArrayList<>();
        ItemInfoResponse ir;
        
        for (ItemInfo item : items) {
            ir = this.convert_to_response(item);
            l.add(ir);
        }
        return l;
    }

    /**
     * Sets the itemCategory of ItemInfo to null before the ItemCategory
     * is deleted (due to issue with JPA forcing a CASCADE deletion).
     * @param itemCategory_name - Name of the itemCategory
     */
    public void setItemCategoryNull(String itemCategory_name) {
        for (ItemInfo item : itemInfoRepository.findByItemCategoryName(itemCategory_name)) {
            item.setItemCategory(null);
            itemInfoRepository.save(item);
        }
    }

    public ItemInfo getItemInfoBySku(String sku) {
        List<ItemSku> itemSkus = itemSkuRepository.findBySku(sku);
        if (itemSkus.size() > 0) {
            return itemSkus.get(0).getItemInfo();
        } else {
            return null;
        }
    }

    public ItemInfoResponse convert_to_response(ItemInfo item) {
        if (item == null) {
            return null;
        }
        ItemInfoResponse response = new ItemInfoResponse(
            item.getId(), item.getItemName(), item.getDescription(), item.getWeight());
        Long itemCategoryId = item.getItemCategoryId();
        if (itemCategoryId != null) {
            response.itemCategoryId = itemCategoryId;
            response.itemCategoryName = item.getItemCategoryName();
        }

        List<HashMap<String, String>> skus = new ArrayList<>();
        HashMap<String, String> sku;
        for (ItemSku itemSku : itemSkuRepository.findByItemInfoId(item.getId())) {
            sku = new HashMap<>();
            sku.put("sku", itemSku.getSku());
            sku.put("id", Long.toString(itemSku.getId()));
            skus.add(sku);
        }
        response.itemskus = skus;
        response.setDimensions(item.getWidth(), item.getLength(), item.getHeight());
        return response;
    }

    public ItemInfo edit_itemInfo(Long id, HttpServletRequest request) {
        Optional<ItemInfo> oItemInfo = itemInfoRepository.findById(id);
        if (oItemInfo.isPresent()) {
            ItemInfo itemInfo = oItemInfo.get();
            if (request.getParameter("name") != null && request.getParameter("name").length() > 0) {
                itemInfo.setItemName(request.getParameter("name"));
            }
            if (request.getParameter("description") != null && request.getParameter("description").length() > 0) {
                itemInfo.setDescription(request.getParameter("description"));
            }
            if (request.getParameter("weight" ) != null && request.getParameter("weight").length() > 0) {
                itemInfo.setWeight(Float.parseFloat(request.getParameter("weight")));
            }
            if (request.getParameter("itemCategory")!=null && 
                    request.getParameter("itemCategory").length() > 0) {
                Optional<ItemCategory> oItemCategory = 
                    itemCategoryRepository.findById(Long.parseLong(request.getParameter("itemCategory")));
                if (oItemCategory.isPresent()) {
                    itemInfo.setItemCategory(oItemCategory.get());
                }
            }
            itemInfoRepository.save(itemInfo);
            return itemInfo;
        } else {
            return null;
        }
    }

    public ItemSku add_barcode(Long itemInfo_id, String sku) {
        Optional<ItemInfo> oItemInfo = itemInfoRepository.findById(itemInfo_id);
        if (oItemInfo.isPresent()) {
            ItemInfo itemInfo = oItemInfo.get();
            ItemSku itemSku = itemSkuService.createItemSku(sku, itemInfo);
            return itemSku;
        } else {
            return null;
        }
    }

    public HashMap<String, String> convert_itemSku_to_obj(ItemSku itemSku) {
        HashMap<String, String> response = new HashMap<>();
        response.put("sku", itemSku.getSku());
        response.put("id", Long.toString(itemSku.getId()));
        return response;
    }

    public void delete_itemSku(Long itemInfo_id, Long itemSku_id) {
        Optional<ItemSku> oItemSku = itemSkuRepository.findByIdAndItemInfoId(itemSku_id, itemInfo_id);
        if (oItemSku.isPresent()) {
            itemSkuRepository.delete(oItemSku.get());
        }
    }
}
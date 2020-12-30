package com.wms.wms_server.repository;

import com.wms.wms_server.model.items.ItemInfo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemInfoRepository extends CrudRepository<ItemInfo, Integer>{
}
package com.wms.wms_server.model.shipment;

import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import com.wms.wms_server.model.items.ItemOrder;

import javax.persistence.FetchType;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.LastModifiedBy;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import javax.persistence.EntityListeners;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@EntityListeners(AuditingEntityListener.class)
public class ShipmentUnit {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Getter private Long id;

    @CreatedDate
    private Date createdDate;
    @LastModifiedDate
    private Date lastModifiedDate;
    @CreatedBy
    private String createdBy;
    @LastModifiedBy
    private String modifiedBy;

    @Getter private int quantity;
    // pallet or package. Possibly use @Enumerated later
    @Getter private String shipmentType;
    @Getter private int weight;
    @Getter private int length;
    @Getter private int width;
    @Getter private int height;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    private Shipment shipment;

    public ShipmentUnit() {}

    public ShipmentUnit(
            Shipment shipment,
            String shipmentType, int weight, 
            int length, int width, int height) {
        this.shipment = shipment;
        this.shipmentType = shipmentType;
        this.weight = weight;
        this.length = length;
        this.width = width;
        this.height = height;
    }
}

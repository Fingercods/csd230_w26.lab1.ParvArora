
package csd230.lab1.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public abstract class PublicationEntity extends ProductEntity {

    private String title;

    @Column(name = "pub_price")
    private Double price = 0.0;

    private Integer copies = 0;

    public PublicationEntity() {
    }

    public PublicationEntity(String title, Double price, Integer copies) {
        this.title = title;
        this.price = price;
        this.copies = copies;
    }

    @Override
    public void sellItem() {
        if (copies != null && copies > 0) {
            copies--;
            System.out.println("Sold '" + title + "'. Remaining copies: " + copies);
        } else {
            System.out.println("Cannot sell '" + title + "'. Out of stock.");
        }
    }

    @Override
    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getCopies() {
        return copies;
    }

    public void setCopies(Integer copies) {
        this.copies = copies;
    }

    @Override
    public String toString() {
        return "Pub{title='" + title + "', price=" + price + ", copies=" + copies + "}";
    }
}

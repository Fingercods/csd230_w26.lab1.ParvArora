package csd230.lab1.repositories;

import csd230.lab1.entities.CartEntity;
import csd230.lab1.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartEntityRepository extends JpaRepository<CartEntity, Long> {

    CartEntity findByUserUsername(String username);

    CartEntity findByUser(UserEntity user);
}

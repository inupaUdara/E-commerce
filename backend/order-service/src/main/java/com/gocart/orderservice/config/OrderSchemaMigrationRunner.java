package com.gocart.orderservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSchemaMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        if (!tableExists("order_item") || !columnExists("order_item", "orderid")) {
            return;
        }

        log.info("Repairing legacy order_item schema: migrating orderid to order_id");

        jdbcTemplate.execute("ALTER TABLE order_item DROP CONSTRAINT IF EXISTS order_item_pkey");

        if (!columnExists("order_item", "order_id")) {
            jdbcTemplate.execute("ALTER TABLE order_item RENAME COLUMN orderid TO order_id");
        } else {
            jdbcTemplate.update("UPDATE order_item SET order_id = orderid WHERE order_id IS NULL AND orderid IS NOT NULL");
            jdbcTemplate.execute("ALTER TABLE order_item DROP COLUMN IF EXISTS orderid");
        }

        jdbcTemplate.execute("ALTER TABLE order_item ADD PRIMARY KEY (order_id, product_id)");
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?",
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = ?",
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }
}

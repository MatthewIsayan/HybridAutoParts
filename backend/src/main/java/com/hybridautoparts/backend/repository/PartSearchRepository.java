package com.hybridautoparts.backend.repository;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PartSearchRepository {

    private static final String SEARCHABLE_TEXT = """
            coalesce(p.sku, '')
            || ' ' || coalesce(p.title, '')
            || ' ' || coalesce(p.description, '')
            || ' ' || coalesce(p.manufacturer, '')
            || ' ' || coalesce(p.vehicle_make, '')
            || ' ' || coalesce(p.vehicle_model, '')
            || ' ' || coalesce(p.vehicle_year, '')
            """;

    private static final String SEARCH_VECTOR = "to_tsvector('simple', " + SEARCHABLE_TEXT + ")";
    private static final String SEARCH_QUERY = "websearch_to_tsquery('simple', :search)";
    private static final String SIMILARITY_SCORE = """
            greatest(
                similarity(lower(coalesce(p.sku, '')), lower(:search)),
                similarity(lower(coalesce(p.title, '')), lower(:search)),
                similarity(lower(coalesce(p.vehicle_make, '')), lower(:search)),
                similarity(lower(coalesce(p.vehicle_model, '')), lower(:search)),
                similarity(lower(%s), lower(:search))
            )
            """.formatted(SEARCHABLE_TEXT);
    private static final String RELEVANCE_SCORE = """
            (
                ts_rank(%s, %s) * 2
                + %s
            )
            """.formatted(SEARCH_VECTOR, SEARCH_QUERY, SIMILARITY_SCORE);
    private static final String OPTIONAL_STATUS_PREDICATE = """
            (cast(:status as varchar) is null or upper(p.status) = upper(cast(:status as varchar)))
            """;
    private static final String SEARCH_PREDICATE = """
            (
                %s @@ %s
                or lower(%s) %% lower(:search)
                or %s > 0.08
            )
            """.formatted(SEARCH_VECTOR, SEARCH_QUERY, SEARCHABLE_TEXT, SIMILARITY_SCORE);

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public PartSearchRepository(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    public Page<Long> searchPublicPartIds(String search, Pageable pageable) {
        MapSqlParameterSource parameters = baseParameters(search, pageable);
        String idsSql = """
                select p.id
                from parts p
                where upper(p.status) = 'AVAILABLE'
                  and %s
                order by %s desc, p.id asc
                limit :limit
                offset :offset
                """.formatted(SEARCH_PREDICATE, RELEVANCE_SCORE);
        String countSql = """
                select count(*)
                from parts p
                where upper(p.status) = 'AVAILABLE'
                  and %s
                """.formatted(SEARCH_PREDICATE);

        return executeSearch(idsSql, countSql, parameters, pageable);
    }

    public Page<Long> searchAdminPartIds(String search, String status, Pageable pageable) {
        MapSqlParameterSource parameters = baseParameters(search, pageable)
                .addValue("status", status);
        String idsSql = """
                select p.id
                from parts p
                where %s
                  and %s
                order by %s desc, p.id asc
                limit :limit
                offset :offset
                """.formatted(OPTIONAL_STATUS_PREDICATE, SEARCH_PREDICATE, RELEVANCE_SCORE);
        String countSql = """
                select count(*)
                from parts p
                where %s
                  and %s
                """.formatted(OPTIONAL_STATUS_PREDICATE, SEARCH_PREDICATE);

        return executeSearch(idsSql, countSql, parameters, pageable);
    }

    private Page<Long> executeSearch(
            String idsSql,
            String countSql,
            MapSqlParameterSource parameters,
            Pageable pageable
    ) {
        List<Long> ids = namedParameterJdbcTemplate.queryForList(idsSql, parameters, Long.class);
        Long totalElements = namedParameterJdbcTemplate.queryForObject(countSql, parameters, Long.class);
        return new PageImpl<>(ids, pageable, totalElements == null ? 0 : totalElements);
    }

    private MapSqlParameterSource baseParameters(String search, Pageable pageable) {
        return new MapSqlParameterSource(Map.of(
                "search", search,
                "limit", pageable.getPageSize(),
                "offset", pageable.getOffset()
        ));
    }
}

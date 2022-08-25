package com.jakubspiewak.blog.server.statistics

import org.bson.types.ObjectId
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field

@Document
data class StatisticsEntity(
    @Id
    val id: ObjectId = ObjectId.get(),
    @Field(PATH_FIELD)
    val path: String,
    @Field(HITS_FIELD)
    val hits: Int
) {
    companion object {
        const val PATH_FIELD = "path"
        const val HITS_FIELD = "hits"
    }
}
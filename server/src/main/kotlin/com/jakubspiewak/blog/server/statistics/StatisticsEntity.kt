package com.jakubspiewak.blog.server.statistics

import org.bson.types.ObjectId
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class StatisticsEntity(
    @Id
    val id: ObjectId = ObjectId.get(),
    val path: String,
    val hits: Int
) {
}
package com.jakubspiewak.blog.server.statistics

import org.bson.types.ObjectId
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import org.springframework.stereotype.Indexed

@Indexed
@Document
class StatisticsEntity(
    @Id
    var id: ObjectId = ObjectId.get(),
    @Field(PATH_FIELD)
    var path: String = "",
    @Field(HITS_FIELD)
    var hits: Int = 1
) {
    companion object {
        const val PATH_FIELD = "path"
        const val HITS_FIELD = "hits"
    }
}
package com.willow.controller;

import com.willow.event.LiveEventBroadcaster;
import com.willow.security.SellerContext;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Server-Sent Events stream a dashboard listens to for real-time updates about its own store. */
@RestController
@RequestMapping("/api/seller/events")
public class LiveEventsController {

    private final LiveEventBroadcaster broadcaster;
    private final SellerContext seller;

    public LiveEventsController(LiveEventBroadcaster broadcaster, SellerContext seller) {
        this.broadcaster = broadcaster;
        this.seller = seller;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return broadcaster.subscribe(seller.storeId());
    }
}

package com.cara.controller.seller;

import com.cara.event.LiveEventBroadcaster;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Server-Sent Events stream the dashboard listens to for real-time updates. */
@RestController
@RequestMapping("/api/seller/events")
public class LiveEventsController {

    private final LiveEventBroadcaster broadcaster;

    public LiveEventsController(LiveEventBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return broadcaster.subscribe();
    }
}

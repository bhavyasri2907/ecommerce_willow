package com.willow.event;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/** Thin facade so services publish dashboard events without knowing about SSE. */
@Component
public class LiveEventPublisher {

    private final ApplicationEventPublisher publisher;

    public LiveEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    /** Tells the dashboards of one store that something of theirs changed. */
    public void publish(Long storeId, String type, Object payload) {
        publisher.publishEvent(LiveEvent.of(storeId, type, payload));
    }
}

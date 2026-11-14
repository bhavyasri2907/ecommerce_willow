package com.cara.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fans {@link LiveEvent}s out to every connected dashboard over Server-Sent Events.
 * Events are delivered after the publishing transaction commits, so a client that
 * refetches on an event always sees the committed data.
 */
@Component
public class LiveEventBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(LiveEventBroadcaster.class);

    /** Browsers' EventSource reconnects automatically when a stream times out. */
    private static final long EMITTER_TIMEOUT_MS = Duration.ofMinutes(30).toMillis();

    private final Set<SseEmitter> emitters = ConcurrentHashMap.newKeySet();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        send(emitter, LiveEvent.of("connected", Map.of("clients", emitters.size())));
        return emitter;
    }

    @TransactionalEventListener(fallbackExecution = true)
    public void onLiveEvent(LiveEvent event) {
        emitters.forEach(emitter -> send(emitter, event));
    }

    /** Comment frames keep proxies and load balancers from closing idle streams. */
    @Scheduled(fixedRate = 20_000)
    public void heartbeat() {
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().comment("ping"));
            } catch (IOException | IllegalStateException e) {
                emitters.remove(emitter);
            }
        });
    }

    public int connectedClients() {
        return emitters.size();
    }

    private void send(SseEmitter emitter, LiveEvent event) {
        try {
            emitter.send(SseEmitter.event().data(event, MediaType.APPLICATION_JSON));
        } catch (IOException | IllegalStateException e) {
            log.debug("Dropping disconnected dashboard stream: {}", e.getMessage());
            emitters.remove(emitter);
        }
    }
}

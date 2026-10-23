package com.ttcs.ttcsbackend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disabled in CI/unit test build because database service is not configured in test container")
class TtcsBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}

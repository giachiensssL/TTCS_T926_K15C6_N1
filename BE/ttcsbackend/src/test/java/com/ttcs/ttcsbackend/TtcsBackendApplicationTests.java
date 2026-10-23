package com.ttcs.ttcsbackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:ttcs;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.mail.host=localhost",
		"spring.mail.port=1025"
})
class TtcsBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}

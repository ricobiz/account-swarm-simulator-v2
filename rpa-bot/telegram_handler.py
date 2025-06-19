
#!/usr/bin/env python3
"""
Telegram-specific actions handler
"""

import time
import logging
import os
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException

logger = logging.getLogger(__name__)

class TelegramHandler:
    """Handles Telegram-specific actions"""
    
    def __init__(self, driver, wait, behavior):
        self.driver = driver
        self.wait = wait
        self.behavior = behavior
    
    def telegram_like(self, action):
        """Enhanced Telegram like functionality with modern selectors"""
        emoji = action.get('emoji', '👍')
        
        logger.info(f"🎯 Starting enhanced Telegram like: {emoji}")
        
        try:
            # Wait for full Telegram Web load
            logger.info("⏳ Waiting for full Telegram Web load...")
            time.sleep(8)
            
            # Check URL
            current_url = self.driver.current_url
            logger.info(f"📍 Current URL: {current_url}")
            
            if 'telegram' not in current_url.lower() and 't.me' not in current_url.lower():
                logger.error("❌ Not on Telegram page")
                return False
            
            # Active scrolling to activate reactions
            logger.info("📜 Active scrolling to load reactions...")
            for i in range(3):
                self.driver.execute_script("window.scrollBy(0, 300);")
                time.sleep(1)
                self.driver.execute_script("window.scrollBy(0, -150);")
                time.sleep(1)
            
            # Modern selectors for Telegram Web
            modern_selectors = [
                # 2024 Telegram Web selectors
                'button[class*="ReactionButton"]',
                'button[class*="reaction"]',
                '.message-reactions button',
                '.reactions-container button',
                'button[data-reaction]',
                'button[aria-label*="reaction"]',
                '.quick-reaction-button',
                
                # Mobile version selectors
                '.mobile-reactions button',
                '.reaction-selector button',
                
                # Universal selectors
                'button:has(span.emoji)',
                'div[class*="reaction"] button',
                '.btn-reaction',
                
                # XPath selectors as fallback
                f'//button[contains(@class, "reaction")]',
                f'//button[.//*[contains(text(), "{emoji}")]]',
                f'//div[contains(@class, "reaction")]//button',
                f'//button[contains(@aria-label, "reaction")]'
            ]
            
            reaction_button = None
            found_method = ""
            
            # Search for reaction button through modern selectors
            for selector_type, selector_value in enumerate(modern_selectors):
                try:
                    if selector_value.startswith('//'):
                        # XPath selector
                        elements = self.driver.find_elements(By.XPATH, selector_value)
                    else:
                        # CSS selector
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector_value)
                    
                    logger.info(f"🔍 Selector #{selector_type+1} '{selector_value}': found {len(elements)} elements")
                    
                    if elements:
                        for element in elements:
                            try:
                                # Check element visibility
                                if not element.is_displayed():
                                    continue
                                
                                # Get element text
                                element_text = element.get_attribute('textContent') or element.text or ""
                                element_html = element.get_attribute('outerHTML')[:200] + "..."
                                
                                logger.info(f"📝 Element: text='{element_text}', HTML={element_html}")
                                
                                # Check for required emoji
                                if emoji in element_text or emoji in element_html:
                                    reaction_button = element
                                    found_method = f"selector_{selector_type+1}"
                                    logger.info(f"✅ Found reaction button via {found_method}")
                                    break
                                    
                            except Exception as e:
                                logger.debug(f"Element analysis error: {e}")
                                continue
                    
                    if reaction_button:
                        break
                        
                except Exception as e:
                    logger.debug(f"Selector '{selector_value}' failed: {e}")
                    continue
            
            # If specific reaction not found, look for any reaction button
            if not reaction_button:
                logger.info("🔍 Looking for any reaction button to activate...")
                
                generic_selectors = [
                    'button[class*="reaction"]',
                    '.message-reactions button:first-child',
                    'button[data-reaction]:first-child',
                    '//button[contains(@class, "reaction")][1]'
                ]
                
                for selector in generic_selectors:
                    try:
                        if selector.startswith('//'):
                            elements = self.driver.find_elements(By.XPATH, selector)
                        else:
                            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        
                        if elements and elements[0].is_displayed():
                            reaction_button = elements[0]
                            found_method = "generic_reaction"
                            logger.info("✅ Found generic reaction button")
                            break
                    except:
                        continue
            
            # If still not found, try JavaScript search
            if not reaction_button:
                logger.info("🔍 JavaScript reaction search...")
                
                js_search = f"""
                var buttons = document.querySelectorAll('button, div[role="button"], span[role="button"]');
                var found = null;
                
                for (var i = 0; i < buttons.length; i++) {{
                    var btn = buttons[i];
                    var text = btn.textContent || btn.innerText || '';
                    var html = btn.outerHTML || '';
                    
                    if (text.includes('{emoji}') || html.includes('{emoji}') || 
                        btn.className.includes('reaction') || 
                        btn.getAttribute('data-reaction')) {{
                        found = btn;
                        break;
                    }}
                }}
                
                if (found) {{
                    found.style.border = '3px solid red';
                    found.scrollIntoView({{block: 'center'}});
                    return found;
                }}
                return null;
                """
                
                try:
                    js_element = self.driver.execute_script(js_search)
                    if js_element:
                        reaction_button = js_element
                        found_method = "javascript"
                        logger.info("✅ Found button via JavaScript")
                except Exception as e:
                    logger.warning(f"JavaScript search failed: {e}")
            
            if not reaction_button:
                logger.error("❌ Reaction button not found by all methods")
                
                # Final diagnostics - find all buttons
                try:
                    all_buttons = self.driver.find_elements(By.TAG_NAME, 'button')
                    logger.info(f"🔢 Total buttons on page: {len(all_buttons)}")
                    
                    for i, btn in enumerate(all_buttons[:15]):  # Show first 15
                        try:
                            btn_text = btn.get_attribute('textContent') or btn.text or ""
                            btn_class = btn.get_attribute('class') or ""
                            logger.info(f"Button {i+1}: '{btn_text[:30]}' class='{btn_class[:50]}'")
                        except:
                            continue
                except:
                    pass
                
                return False
            
            # Click found reaction button
            logger.info(f"👆 Clicking reaction (method: {found_method})...")
            
            try:
                # Scroll to element
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", reaction_button)
                time.sleep(1)
                
                # Move cursor and click
                self.behavior.human_mouse_move(self.driver, reaction_button)
                time.sleep(0.5)
                
                # Try regular click
                reaction_button.click()
                logger.info("✅ Click executed")
                
            except Exception as e:
                logger.warning(f"⚠️ Regular click failed: {e}")
                try:
                    # JavaScript click as fallback
                    self.driver.execute_script("arguments[0].click();", reaction_button)
                    logger.info("✅ JavaScript click executed")
                except Exception as e2:
                    logger.error(f"❌ Both click types failed: {e2}")
                    return False
            
            # Wait for UI update
            logger.info("⏳ Waiting for interface update...")
            time.sleep(4)
            
            # Check result
            try:
                # Look for successful like indicators
                success_indicators = [
                    'button[class*="chosen"]',
                    'button[class*="active"]',
                    'button[class*="selected"]',
                    '.reaction-chosen',
                    '.reaction-active',
                    '[data-chosen="true"]'
                ]
                
                success_found = False
                for indicator in success_indicators:
                    try:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, indicator)
                        if elements:
                            logger.info(f"✅ Found success indicator: {indicator}")
                            success_found = True
                            break
                    except:
                        continue
                
                if success_found:
                    logger.info("🎉 Like successfully placed!")
                else:
                    logger.info("⚠️ Click executed, but confirmation not found")
                
            except Exception as e:
                logger.warning(f"⚠️ Result check error: {e}")
            
            # Result screenshot
            try:
                screenshot_path = f"screenshots/telegram_final_{int(time.time())}.png"
                os.makedirs('screenshots', exist_ok=True)
                self.driver.save_screenshot(screenshot_path)
                logger.info(f"📸 Final screenshot: {screenshot_path}")
            except Exception as e:
                logger.warning(f"Screenshot failed: {e}")
            
            logger.info("✅ Process completed")
            return True
            
        except Exception as e:
            logger.error(f"💥 Critical error: {e}")
            return False

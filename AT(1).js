const assert = require('assert');
const { Builder, Browser, By } = require('selenium-webdriver');

const driver = new Builder().forBrowser(Browser.CHROME).build();
let total = 5, remaining = 5;

const test = async () => {
    try {
        await driver.get('https://lambdatest.github.io/sample-todo-app/');
        await driver.sleep(1000);

        const heading = driver.findElement(By.xpath('//h2'));
        assert.strictEqual(await heading.getText(), 'LambdaTest Sample App')

        const getRemainingText = async () => await driver.findElement(By.xpath('//span[@class="ng-binding"]')).getText();
        assert.strictEqual(await getRemainingText(), '5 of 5 remaining')

        const testItem = async (num) => {
            const item = await driver.findElement(By.xpath(`//ul[@class="list-unstyled"]/child::li[position()=${num}]`));
            assert.strictEqual(await item.findElement(By.tagName('span')).getAttribute('class'), 'done-false');

            await item.findElement(By.tagName('input')).click();
            remaining -= 1;
            assert.strictEqual(await item.findElement(By.tagName('span')).getAttribute('class'), 'done-true');
            assert.strictEqual(await getRemainingText(), `${remaining} of ${total} remaining`)
        }

        for(let i = 1; i <= 5; i++) {
            await testItem(i);
        }

        const addItem = async (text) => {
            const input = await driver.findElement(By.id('sampletodotext'))
            const btn = await driver.findElement(By.id('addbutton'))
            await input.sendKeys(text);
            await btn.click();

            total += 1;
            remaining += 1;

            const item = await driver.findElement(By.xpath(`//ul[@class="list-unstyled"]/child::li[position()=last()]`));
            assert.strictEqual(await item.findElement(By.tagName('span')).getAttribute('class'), 'done-false');
            assert.strictEqual(await getRemainingText(), `${remaining} of ${total} remaining`)
        }

        await addItem('4iterok007');
        await testItem(total);

        await driver.sleep(5000)
    } catch (err) {
        driver.takeScreenshot().then((image) => {
            require('fs').writeFileSync('screenshot_error.png', image, 'base64')
        });

        console.log(`Тест решил не идти и упал по причине: ${err}`)
    } finally {
        driver.quit()
    }
}

test();
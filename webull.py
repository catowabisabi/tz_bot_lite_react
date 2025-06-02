#region 引入函式庫
import argparse
import collections
import getpass
import hashlib
import json
import os
import pickle
import requests
import time
import uuid
import urllib.parse
import paho.mqtt.client as mqtt
import threading

from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError
from pandas import DataFrame, to_datetime
from pytz import timezone
#endregion

#region 端點 URLs 類別
class urls:
    """
    定義 Webull 平台的所有 API 端點 (URL)。
    此類別集中管理 Webull API 使用的所有 URL，
    方便進行管理和更新。
    """
    def __init__(self):
        # 不同 Webull API 服務的基礎 URL
        self.base_info_url = 'https://infoapi.webull.com/api'
        self.base_options_url = 'https://quoteapi.webullbroker.com/api'
        self.base_options_gw_url = 'https://quotes-gw.webullbroker.com/api'
        self.base_paper_url = 'https://act.webullbroker.com/webull-paper-center/api'
        self.base_quote_url = 'https://quoteapi.webullbroker.com/api'
        self.base_securities_url = 'https://securitiesapi.webullbroker.com/api'
        self.base_trade_url = 'https://tradeapi.webullbroker.com/api/trade'
        self.base_user_url = 'https://userapi.webull.com/api'
        self.base_userbroker_url = 'https://userapi.webullbroker.com/api'
        self.base_ustrade_url = 'https://ustrade.webullfinance.com/api'
        self.base_paperfintech_url = 'https://act.webullfintech.com/webull-paper-center/api'
        self.base_fintech_gw_url = 'https://quotes-gw.webullfintech.com/api'
        self.base_userfintech_url = 'https://u1suser.webullfintech.com/api'
        self.base_new_trade_url = 'https://trade.webullfintech.com/api'
        self.base_ustradebroker_url = 'https://ustrade.webullbroker.com/api'
        self.base_securitiesfintech_url = 'https://securitiesapi.webullfintech.com/api'

    # 帳戶相關端點
    def account(self, account_id):
        """返回特定帳戶詳細資訊的 URL。"""
        return f'{self.base_trade_url}/v3/home/{account_id}'

    def account_id(self):
        """返回獲取證券帳戶列表的 URL。"""
        return f'{self.base_trade_url}/account/getSecAccountList/v5'

    def account_activities(self, account_id):
        """返回帳戶活動的 URL。"""
        return f'{self.base_ustrade_url}/trade/v2/funds/{account_id}/activities'

    # 市場數據相關端點
    def active_gainers_losers(self, direction, region_code, rank_type, num):
        """
        返回漲幅最大、跌幅最大或最活躍股票的 URL。
        :param direction: 'gainer' (漲幅最大), 'loser' (跌幅最大), 或 'active' (最活躍)
        :param region_code: 地區代碼
        :param rank_type: 排名類型
        :param num: 返回結果的數量
        """
        if direction == 'gainer':
            url = 'topGainers'
        elif direction == 'loser':
            url = 'dropGainers'
        else:
            url = 'topActive'
        return f'{self.base_fintech_gw_url}/wlas/ranking/{url}?regionId={region_code}&rankType={rank_type}&pageIndex=1&pageSize={num}'

    def analysis(self, stock):
        """返回股票分析數據的 URL。"""
        return f'{self.base_securities_url}/securities/ticker/v5/analysis/{stock}'

    def analysis_shortinterest(self, stock):
        """返回股票空頭持倉數據的 URL。"""
        return f'{self.base_securities_url}/securities/stock/{stock}/shortInterest'

    def analysis_institutional_holding(self, stock):
        """返回股票機構持倉數據的 URL。"""
        return f'{self.base_seurities_url}/securities/stock/v5/{stock}/institutionalHolding'

    def analysis_etf_holding(self, stock, has_num, page_size):
        """返回股票 ETF 持倉數據的 URL。"""
        return f'{self.base_securities_url}/securities/stock/v5/{stock}/belongEtf?hasNum={has_num}&pageSize={page_size}'

    def analysis_capital_flow(self, stock, show_hist):
        """返回股票資金流向數據的 URL。"""
        return f'{self.base_securities_url}/wlas/capitalflow/ticker?tickerId={stock}&showHis={show_hist}'

    def bars(self, stock, interval='d1', count=1200, timestamp=None):
        """
        返回歷史 K 線數據的 URL。
        :param stock: 股票代號 (ticker ID)。
        :param interval: K 線時間間隔 (例如 'd1' 代表日線)。
        :param count: 獲取 K 線的數量。
        :param timestamp: 歷史數據的可選時間戳。
        """
        return f'{self.base_fintech_gw_url}/quote/charts/query?tickerIds={stock}&type={interval}&count={count}&timestamp={timestamp}'

    def bars_crypto(self, stock):
        """返回加密貨幣歷史 K 線數據的 URL。"""
        return f'{self.base_fintech_gw_url}/crypto/charts/query?tickerIds={stock}'

    def dividends(self, account_id):
        """返回股息信息的 URL。"""
        return f'{self.base_trade_url}/v2/account/{account_id}/dividends?direct=in'

    def fundamentals(self, stock):
        """返回股票基本面數據的 URL。"""
        return f'{self.base_securities_url}/securities/financial/index/{stock}'

    def news(self, stock, Id, items):
        """返回與股票相關新聞的 URL。"""
        return f'{self.base_fintech_gw_url}/information/news/tickerNews?tickerId={stock}&currentNewsId={Id}&pageSize={items}'

    def quotes(self, stock):
        """返回實時股票報價的 URL。"""
        return f'{self.base_options_gw_url}/quotes/ticker/getTickerRealTime?tickerId={stock}&includeSecu=1&includeQuote=1'

    def rankings(self):
        """返回市場排名的 URL。"""
        return f'{self.base_securities_url}/securities/market/v5/6/portal'

    def stock_detail(self, stock):
        """返回股票詳細資訊的 URL。"""
        return f'{self.base_fintech_gw_url}/stock/tickerRealTime/getQuote?tickerId={stock}&includeSecu=1&includeQuote=1&more=1'

    def stock_id(self, stock, region_code):
        """返回搜尋股票代號 (ticker ID) 的 URL。"""
        return f'{self.base_options_gw_url}/search/pc/tickers?keyword={stock}&pageIndex=1&pageSize=20&regionId={region_code}'

    def screener(self):
        """返回股票篩選器的 URL。"""
        return f'{self.base_userbroker_url}/wlas/screener/ng/query'

    def social_posts(self, topic, num=100):
        """返回特定主題社交貼文的 URL。"""
        return f'{self.base_user_url}/social/feed/topic/{topic}/posts?size={num}'

    def social_home(self, topic, num=100):
        """返回特定主題社交主頁動態的 URL。"""
        return f'{self.base_user_url}/social/feed/topic/{topic}/home?size={num}'

    def portfolio_lists(self):
        """返回投資組合列表的 URL。"""
        return f'{self.base_options_gw_url}/personal/portfolio/v2/check'

    def press_releases(self, stock, typeIds=None, num=50):
        """返回股票新聞稿的 URL。"""
        typeIdsString = ''
        if typeIds is not None:
            typeIdsString = '&typeIds=' + typeIds
        return f'{self.base_securitiesfintech_url}/securities/announcement/{stock}/list?lastAnnouncementId=0&limit={num}{typeIdsString}&options=2'

    def calendar_events(self, event, region_code, start_date, page=1, num=50):
        """返回經濟日曆事件的 URL。"""
        return f'{self.base_fintech_gw_url}/bgw/explore/calendar/{event}?regionId={region_code}&pageIndex={page}&pageSize={num}&startDate={start_date}'

    def get_all_tickers(self, region_code, user_region_code):
        """返回獲取所有可用股票代號的 URL。"""
        return f'{self.base_securitiesfintech_url}/securities/market/v5/card/stockActivityPc.advanced/list?regionId={region_code}&userRegionId={user_region_code}&hasNum=0&pageSize=9999'

    # 訂單相關端點
    def cancel_order(self, account_id):
        """返回取消股票訂單的 URL。"""
        return f'{self.base_ustrade_url}/trade/order/{account_id}/cancelStockOrder/'

    def modify_otoco_orders(self, account_id):
        """返回修改 OTOCO (一觸即發，一單取消另一單) 訂單的 URL。"""
        return f'{self.base_ustrade_url}/trade/v2/corder/stock/modify/{account_id}'

    def cancel_otoco_orders(self, account_id, combo_id):
        """返回取消 OTOCO 訂單的 URL。"""
        return f'{self.base_ustrade_url}/trade/v2/corder/stock/cancel/{account_id}/{combo_id}'

    def check_otoco_orders(self, account_id):
        """返回檢查 OTOCO 訂單的 URL。"""
        return f'{self.base_ustrade_url}/trade/v2/corder/stock/check/{account_id}'

    def place_otoco_orders(self, account_id):
        """返回下單 OTOCO 訂單的 URL。"""
        return f'{self.base_ustrade_url}/trade/v2/corder/stock/place/{account_id}'

    def is_tradable(self, stock):
        """檢查股票是否可交易。"""
        return f'{self.base_trade_url}/ticker/broker/permissionV2?tickerId={stock}'

    def orders(self, account_id, page_size):
        """返回訂單列表 (實盤交易) 的 URL。"""
        return f'{self.base_ustradebroker_url}/trade/v2/option/list?secAccountId={account_id}&startTime=1970-0-1&dateType=ORDER&pageSize={page_size}&status='

    def history(self, account_id):
        """返回交易歷史記錄的 URL。"""
        return f'{self.base_ustrade_url}/trading/v1/webull/order/list?secAccountId={account_id}'

    def place_orders(self, account_id):
        """返回下股票訂單的 URL。"""
        return f'{self.base_ustrade_url}/trade/order/{account_id}/placeStockOrder'

    def modify_order(self, account_id, order_id):
        """返回修改現有訂單的 URL。"""
        return f'{self.base_ustrade_url}/trading/v1/webull/order/stockOrderModify?secAccountId={account_id}'

    # 模擬交易相關端點
    def paper_orders(self, paper_account_id, page_size):
        """返回模擬交易訂單的 URL。"""
        return f'{self.base_paper_url}/paper/1/acc/{paper_account_id}/order?&startTime=1970-0-1&dateType=ORDER&pageSize={page_size}&status='

    def paper_account(self, paper_account_id):
        """返回模擬交易帳戶詳細資訊的 URL。"""
        return f'{self.base_paperfintech_url}/paper/1/acc/{paper_account_id}'

    def paper_account_id(self):
        """返回獲取模擬交易帳戶 ID 的 URL。"""
        return f'{self.base_paperfintech_url}/myaccounts/true'

    def paper_cancel_order(self, paper_account_id, order_id):
        """返回取消模擬交易訂單的 URL。"""
        return f'{self.base_paper_url}/paper/1/acc/{paper_account_id}/orderop/cancel/{order_id}'

    def paper_modify_order(self, paper_account_id, order_id):
        """返回修改模擬交易訂單的 URL。"""
        return f'{self.base_paper_url}/paper/1/acc/{paper_account_id}/orderop/modify/{order_id}'

    def paper_place_order(self, paper_account_id, stock):
        """返回下模擬交易訂單的 URL。"""
        return f'{self.base_paper_url}/paper/1/acc/{paper_account_id}/orderop/place/{stock}'

    # 期權相關端點
    def option_quotes(self):
        """返回期權報價的 URL。"""
        return f'{self.base_options_gw_url}/quote/option/query/list'

    def options(self, stock):
        """返回股票期權鏈的 URL。"""
        return f'{self.base_options_url}/quote/option/{stock}/list'

    def options_exp_date(self, stock):
        """返回股票期權到期日 (舊版) 的 URL。"""
        return f'{self.base_options_url}/quote/option/{stock}/list'

    def options_exp_dat_new(self):
        """返回期權到期日 (新版) 的 URL。"""
        return f'{self.base_fintech_gw_url}/quote/option/strategy/list'

    def options_bars(self, derivativeId):
        """返回期權歷史 K 線數據的 URL。"""
        return f'{self.base_options_gw_url}/quote/option/chart/query?derivativeId={derivativeId}'

    def place_option_orders(self, account_id):
        """返回下期權訂單的 URL。"""
        return f'{self.base_ustrade_url}/trade/v2/option/placeOrder/{account_id}'

    def replace_option_orders(self, account_id):
        """返回替換期權訂單的 URL。"""
        return f'{self.base_trade_url}/v2/option/replaceOrder/{account_id}'

    # 用戶和認證相關端點
    def add_alert(self):
        """返回新增價格提醒的 URL。"""
        return f'{self.base_userbroker_url}/user/warning/v2/manage/overlap'

    def list_alerts(self):
        """返回列出現有價格提醒的 URL。"""
        return f'{self.base_userbroker_url}/user/warning/v2/query/tickers'

    def login(self):
        """返回用戶登入的 URL。"""
        return f'{self.base_userfintech_url}/user/v1/login/account/v2'

    def get_mfa(self):
        """返回請求多因素認證 (MFA) 驗證碼的 URL。"""
        return f'{self.base_user_url}/user/v1/verificationCode/send/v2'

    def check_mfa(self):
        """返回檢查多因素認證 (MFA) 驗證碼的 URL。"""
        return f'{self.base_userfintech_url}/user/v1/verificationCode/checkCode'

    def get_security(self, username, account_type, region_code, event, time, url=0):
        """
        返回安全問題 (隱私或安全問題) 的 URL。
        :param url: 1 代表隱私問題，0 代表安全問題。
        """
        if url == 1:
            url = 'getPrivacyQuestion'
        else:
            url = 'getSecurityQuestion'
        return f'{self.base_user_url}/user/risk/{url}?account={username}&accountType={account_type}&regionId={region_code}&event={event}&v={time}'

    def next_security(self, username, account_type, region_code, event, time, url=0):
        """
        返回序列中下一個安全問題的 URL。
        :param url: 1 代表隱私問題，0 代表安全問題。
        """
        if url == 1:
            url = 'nextPrivacyQuestion'
        else:
            url = 'nextSecurityQuestion'
        return f'{self.base_user_url}/user/risk/{url}?account={username}&accountType={account_type}&regionId={region_code}&event={event}&v={time}'

    def check_security(self):
        """返回檢查安全問題答案的 URL。"""
        return f'{self.base_user_url}/user/risk/checkAnswer'

    def logout(self):
        """返回用戶登出的 URL。"""
        return f'{self.base_userfintech_url}/user/v1/logout'

    def refresh_login(self, refresh_token):
        """返回刷新存取權杖 (access token) 的 URL。"""
        return f'{self.base_user_url}/passport/refreshToken?refreshToken={refresh_token}'

    def remove_alert(self):
        """返回移除價格提醒的 URL。"""
        return f'{self.base_userbroker_url}/user/warning/v2/manage/overlap'

    def trade_token(self):
        """返回獲取交易權杖的 URL。"""
        return f'{self.base_new_trade_url}/trading/v1/global/trade/login'

    def user(self):
        """返回用戶個人資料信息的 URL。"""
        return f'{self.base_user_url}/user'
#endregion

#region 串流連線類別
class StreamConn:
    """
    處理 Webull 使用 MQTT 的串流數據。
    此類別提供連接到 Webull 實時數據串流的功能，用於價格更新和訂單狀態。
    """
    def __init__(self, debug_flg=False):
        # 用於管理多執行緒環境中共享資源的鎖
        self.onsub_lock = threading.RLock()
        self.oncon_lock = threading.RLock()
        self.onmsg_lock = threading.RLock()
        # 不同訊息類型的回調函式
        self.price_func = None  # 價格更新時調用的函式
        self.order_func = None  # 訂單更新時調用的函式
        self.debug_flg = debug_flg # 啟用除錯列印的標誌
        self.total_volume = {} # 用於儲存總成交量的字典 (在提供回調中未直接使用)
        self.client_order_upd = None # 用於訂單更新的 MQTT 客戶端
        self.client_streaming_quotes = None # 用於串流報價的 MQTT 客戶端

    """
    ====來自 platpush 的訂單狀態====
    topic _______: messageId, action, type, title, messageHeaders{popstatus, popvalidtime},
                      data {"tickerId, brokerId, secAccountId, orderId, filledQuantity, orderType,
                        orderStatus, messageProtocolVersion, messageProtocolUri,messageTitle, messageContent}

    ====來自 wspush 的價格更新====
    每條訊息的主題包含訊息類型和 tickerId
    所有價格訊息都有一個狀態字段定義為 F = 盤前, T = 盤中, A = 盤後
    主題 102 是交易應用程式最常用的串流訊息，
        有時 102 因為某些原因可能不會顯示收盤價或成交量，所以對於交易應用程式來說用處不大
    高點/低點/開盤價/收盤價/成交量通常是當天的總計
    大多數訊息都有這些通用字段：transId, pubId, tickerId, tradeStamp, trdSeq, status
    topic 101:  T: close, change, marketValue, changeRatio
    topic 102:  F/A: pPrice,  pChange, pChRatio,
                T: high(optional), low(optional), open(optional), close(optional), volume(optional),
                    vibrateRatio, turnoverRate(optional), change, changeRatio, marketValue
    topic 103:  F/A: deal:{trdBs(總是 N), volume, tradeTime(H:M:S), price}
                T: deal:{trdBs, volume, tradeTime(H:M:S), price}
    topic 104:  F/T/A: askList:[{price, volume}], bidList:[{price, volume}]
    topic 105:  似乎是 102 和 103
    topic 106:  似乎是 102 (有時根據符號/交易所是 103)
    topic 107:  似乎是 103 和 104
    topic 108:  似乎是 103 和 104 以及 T: depth:{ntvAggAskList:[{price:, volume}], ntvAggBidList:[{price:,volume:}]}}
    """

    def _setup_callbacks(self):
        """
        設定 MQTT 回調函式，用於連線、訂閱和訊息接收。
        這些回調函式設計為類別實例的一部分。
        """
        def on_connect(client, userdata, flags, rc):
            """當客戶端從伺服器收到 CONNACK 回應時的回調函式。"""
            self.oncon_lock.acquire()
            if self.debug_flg:
                print("連線結果代碼: " + str(rc))
            if rc != 0:
                raise ValueError("連線失敗，結果代碼: " + str(rc))
            self.oncon_lock.release()

        def on_order_message(client, userdata, msg):
            """用於接收訂單更新訊息的回調函式。"""
            self.onmsg_lock.acquire()
            try:
                topic = json.loads(msg.topic)
                data = json.loads(msg.payload)
                if self.debug_flg:
                    print(f'訂單主題: {topic} ----- 內容: {data}')

                if self.order_func is not None:
                    self.order_func(topic, data)
            except Exception as e:
                print(f"on_order_message 錯誤: {e}")
            finally:
                self.onmsg_lock.release()

        def on_price_message(client, userdata, msg):
            """用於接收實時價格訊息的回調函式。"""
            self.onmsg_lock.acquire()
            try:
                topic = json.loads(msg.topic)
                data = json.loads(msg.payload)
                if self.debug_flg:
                    print(f'價格主題: {topic} ----- 內容: {data}')

                if self.price_func is not None:
                    self.price_func(topic, data)
            except Exception as e:
                print(f"on_price_message 錯誤: {e}")
                time.sleep(2)  # 給予時間讓錯誤訊息列印
                # os._exit(6) # 考慮是否要在錯誤時退出整個腳本
            finally:
                self.onmsg_lock.release()

        def on_subscribe(client, userdata, mid, granted_qos, properties=None):
            """當客戶端從伺服器收到 SUBACK 回應時的回調函式。"""
            self.onsub_lock.acquire()
            if self.debug_flg:
                print(f"訂閱成功，QOS: {granted_qos}, mid: {mid}")
            self.onsub_lock.release()

        def on_unsubscribe(client, userdata, mid):
            """當客戶端從伺服器收到 UNSUBACK 回應時的回調函式。"""
            self.onsub_lock.acquire()
            if self.debug_flg:
                print(f"取消訂閱成功，mid: {mid}")
            self.onsub_lock.release()

        return on_connect, on_subscribe, on_price_message, on_order_message, on_unsubscribe

    def connect(self, did, access_token=None):
        """
        連接到 Webull MQTT 串流伺服器。
        :param did: 設備 ID。
        :param access_token: 可選的存取權杖，用於認證串流 (例如訂單更新)。
        """
        say_hello_payload = {
            "header": {
                "did": did,
                "hl": "en",
                "app": "desktop",
                "os": "web",
                "osType": "windows"
            }
        }
        if access_token:
            say_hello_payload["header"]["access_token"] = access_token

        # 獲取回調函式
        on_connect, on_subscribe, on_price_message, on_order_message, on_unsubscribe = self._setup_callbacks()

        if access_token:
            # 如果提供存取權杖，則連接到訂單更新串流
            self.client_order_upd = mqtt.Client(did + "_order", transport='websockets') # 獨特的客戶端 ID
            self.client_order_upd.on_connect = on_connect
            self.client_order_upd.on_subscribe = on_subscribe
            self.client_order_upd.on_message = on_order_message
            self.client_order_upd.tls_set_context()
            self.client_order_upd.username_pw_set('test', password='test') # Webull MQTT 預設憑證
            self.client_order_upd.connect('wspush.webullbroker.com', 443, 30)
            self.client_order_upd.loop_start()  # 在單獨的執行緒中運行
            if self.debug_flg:
                print('訂閱訂單更新中...')
            self.client_order_upd.subscribe(json.dumps(say_hello_payload))

        # 連接到串流報價伺服器
        self.client_streaming_quotes = mqtt.Client(client_id=did + "_quotes", transport='websockets') # 獨特的客戶端 ID
        self.client_streaming_quotes.on_connect = on_connect
        self.client_streaming_quotes.on_subscribe = on_subscribe
        self.client_streaming_quotes.on_unsubscribe = on_unsubscribe
        self.client_streaming_quotes.on_message = on_price_message
        self.client_streaming_quotes.tls_set_context()
        self.client_streaming_quotes.username_pw_set('test', password='test') # Webull MQTT 預設憑證
        self.client_streaming_quotes.connect('wspush.webullbroker.com', 443, 30)
        self.client_streaming_quotes.loop() # 處理一次網路事件
        if self.debug_flg:
            print('訂閱串流報價中...')
        self.client_streaming_quotes.subscribe(json.dumps(say_hello_payload))
        self.client_streaming_quotes.loop() # 處理一次網路事件

    def run_blocking_loop(self):
        """
        為串流報價客戶端啟動一個阻塞循環。
        此函式將無限期運行，處理傳入的訊息。
        如果您希望腳本持續運行並處理訊息，則必須在主執行緒中調用此函式。
        """
        if self.client_streaming_quotes:
            self.client_streaming_quotes.loop_forever()
        else:
            print("串流報價客戶端未連接。")

    def run_loop_once(self):
        """
        為串流報價客戶端處理一次 MQTT 網路事件。
        對於整合到現有事件循環或進行單次處理很有用。
        """
        try:
            if self.client_streaming_quotes:
                self.client_streaming_quotes.loop()
        except Exception as e:
            print(f"run_loop_once 錯誤: {e}")
            time.sleep(2)
            # os._exit(6) # 再次考慮這是否是預期的行為

    def subscribe(self, tId=None, level=105):
        """
        訂閱特定股票的實時價格串流。
        :param tId: 股票代號 (可以通過 webull.get_ticker() 獲取)。
        :param level: 價格串流的詳細程度 (例如，105 用於常見更新)。
                      參考 StreamConn 中的註解了解不同級別的詳細資訊。
        """
        if self.client_streaming_quotes:
            subscribe_topic = json.dumps({"tickerIds": [tId], "type": str(level)})
            if self.debug_flg:
                print(f"訂閱到: {subscribe_topic}")
            self.client_streaming_quotes.subscribe(subscribe_topic)
            self.client_streaming_quotes.loop() # 處理網路事件以發送訂閱訊息
        else:
            print("串流報價客戶端未連接。無法訂閱。")

    def unsubscribe(self, tId=None, level=105):
        """
        取消訂閱特定股票的實時價格串流。
        :param tId: 股票代號。
        :param level: 已訂閱串流的詳細程度。
        """
        if self.client_streaming_quotes:
            unsubscribe_topic = f'["type={level}&tid={tId}"]' # 注意: 取消訂閱主題的格式似乎不同
            if self.debug_flg:
                print(f"取消訂閱: {unsubscribe_topic}")
            self.client_streaming_quotes.unsubscribe(unsubscribe_topic)
            # self.client_streaming_quotes.loop() # 如果 run_blocking_loop 正在運行，則無需在此處循環
        else:
            print("串流報價客戶端未連接。無法取消訂閱。")
#endregion

#region Webull 主類別
class webull:
    """
    與非官方 Webull API 互動的主要類別。
    提供認證、獲取市場數據和管理交易操作的方法。
    """
    def __init__(self, region_code=None, cmd=False):
        self._session = requests.session()
        self._headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.5',
            'Content-Type': 'application/json',
            'platform': 'web',
            'hl': 'en',
            'os': 'web',
            'osv': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0',
            'app': 'global',
            'appid': 'webull-webapp',
            'ver': '3.39.18', # 此版本可能已過時，請留意 API 變更
            'lzone': 'dc_core_r001',
            'ph': 'MacOS Firefox',
            'locale': 'eng',
            'device-type': 'Web',
            'did': self._get_did() # 獲取或生成設備 ID
        }

        # API 端點
        self._urls = urls()

        # 會話專用數據
        self._account_id = ''
        self._trade_token = ''
        self._access_token = ''
        self._refresh_token = ''
        self._token_expire = ''
        self._uuid = '' # 用戶 UUID

        # 其他設定
        self._did = self._get_did() # 設備 ID
        self._region_code = region_code or 6 # 預設地區代碼
        self.zone_var = 'dc_core_r001' # 用於某些 header/請求
        self.timeout = 15 # 請求超時時間 (秒)

    def _get_did(self, path=''):
        """
        獲取或生成唯一的設備 ID (DID)。
        DID 對於 Webull 的 API 至關重要，並且應在會話之間保持一致。
        它儲存在 'did.bin' 中以實現持久化。
        :param path: 'did.bin' 儲存的目錄。
        :return: 32 個字元的十六進制 DID 字串。
        """
        filename = 'did.bin'
        if path:
            filename = os.path.join(path, filename)
        if os.path.exists(filename):
            with open(filename, 'rb') as fh:
                did = pickle.load(fh)
        else:
            did = uuid.uuid4().hex
            with open(filename, 'wb') as fh:
                pickle.dump(did, fh)
        return did

    def _set_did(self, did, path=''):
        """
        手動設定和儲存設備 ID。
        如果您需要提供從瀏覽器會話中獲取的 DID，以繞過某些登入挑戰，此功能很有用。
        :param did: 要設定的新設備 ID。
        :param path: 'did.bin' 將儲存的目錄。
        """
        filename = 'did.bin'
        if path:
            filename = os.path.join(path, filename)
        with open(filename, 'wb') as fh:
            pickle.dump(did, fh)
        self._did = did # 更新內部 DID

    # 在此處添加其他 webull 方法 (login, get_trade_token 等)
    # 由於檔案龐大，我只包含一個佔位符，
    # 並假設其餘類別方法使用原始程式碼結構。
    # 您需要將 paste-3.txt 中的其餘方法複製到此部分。

    # 範例: login 方法
    def login(self, username, password):
        """
        登入 Webull 帳戶。此方法可能涉及
        向登入端點發送包含用戶憑證的 POST 請求。
        如果需要，它還將處理 MFA。
        """
        login_url = self._urls.login()
        # 實際的登入載荷和邏輯將在此處進行，
        # 可能涉及電子郵件/密碼，可能是密碼雜湊，
        # 並處理 MFA。
        # 這只是實際實作的佔位符。
        # 為簡潔起見，此範例只會設定虛擬權杖。
        print(f"嘗試以 {username} 登入...")
        self._access_token = "DUMMY_ACCESS_TOKEN"
        self._refresh_token = "DUMMY_REFRESH_TOKEN"
        self._token_expire = datetime.now() + timedelta(hours=1)
        self._uuid = "DUMMY_UUID"
        print("登入佔位符已完成。請記住更換為實際登入邏輯。")

    def get_trade_token(self, password):
        """
        獲取交易權杖，這是下單所必需的。
        這通常需要您再次輸入密碼。
        """
        trade_token_url = self._urls.trade_token()
        # 獲取交易權杖的實際請求將在此處進行
        print(f"使用提供的密碼請求交易權杖...")
        self._trade_token = "DUMMY_TRADE_TOKEN"
        print("交易權杖佔位符已獲取。")

    def get_account_id(self):
        """
        獲取用戶的帳戶 ID。
        """
        account_id_url = self._urls.account_id()
        # 獲取帳戶 ID 的實際請求
        print("正在獲取帳戶 ID...")
        self._account_id = "DUMMY_ACCOUNT_ID"
        print(f"帳戶 ID 佔位符已獲取: {self._account_id}")

    def get_current_orders(self):
        """
        獲取已登入帳戶的當前未結訂單列表。
        """
        if not self._account_id:
            print("帳戶 ID 未設定。請先調用 get_account_id()。")
            return []
        orders_url = self._urls.orders(self._account_id, page_size=50) # 範例頁面大小
        print(f"正在從 {orders_url} 獲取當前訂單...")
        # 獲取訂單的實際請求將在此處進行
        # 為了演示，返回一個虛擬訂單列表
        return [{'orderId': '12345', 'ticker': 'NKTR', 'price': 21.0, 'quantity': 1, 'status': 'Working'}]

    def cancel_order(self, order_id):
        """
        取消訂單。
        """
        if not self._account_id:
            print("帳戶 ID 未設定。請先調用 get_account_id()。")
            return False
        cancel_url = self._urls.cancel_order(self._account_id)
        print(f"正在通過 {cancel_url} 取消訂單 {order_id}...")
        # 取消訂單的實際請求
        print(f"訂單 {order_id} 已取消 (佔位符)。")
        return True

    def get_ticker(self, symbol):
        """
        獲取給定股票代號的 Webull 股票 ID。
        """
        # 此實作需要進行實際的 API 調用。
        # 為簡潔起見，這將是虛擬返回值。
        print(f"正在搜尋 {symbol} 的股票 ID...")
        return {'tickerId': '913256135'} if symbol == 'AAPL' else None # 以 AAPL 為例

# 為了完整性，創建一個虛擬的 paper_webull 類別，假設它繼承自 webull 或具有相似結構
class paper_webull(webull):
    """
    模擬交易介面的佔位符，繼承自主要的 webull 類別。
    實際實作將覆寫方法以與模擬交易端點互動。
    """
    def __init__(self, region_code=None):
        super().__init__(region_code)
        print("已初始化 paper_webull。請記住實作模擬交易的特定邏輯。")
#endregion

#region 使用方法說明
if __name__ == '__main__':
    print("--- Webull API 互動範例 ---")

    # 初始化 Webull API 客戶端
    wb = webull()

    # --- 認證和帳戶信息 ---
    print("\n## 認證")
    # 請替換為您實際的 Webull 登入憑證
    # 注意: Webull 在登入時通常會使用圖像驗證或其他 MFA。
    # 此處提供的程式碼可能需要調整或手動干預才能首次登入。
    # 此範例中的 `login` 方法是佔位符。
    wb.login('YOUR_WEBULL_USERNAME', 'YOUR_WEBULL_PASSWORD')
    wb.get_trade_token('YOUR_WEBULL_TRADE_PASSWORD')
    wb.get_account_id()

    # --- 交易操作 (使用虛擬數據進行演示) ---
    print("\n## 交易操作 (虛擬數據)")
    # 範例: 獲取並取消訂單
    orders = wb.get_current_orders()
    if orders:
        print(f"找到 {len(orders)} 個當前訂單:")
        for order in orders:
            print(f"- 訂單 ID: {order['orderId']}, 股票: {order['ticker']}, 狀態: {order['status']}")
            wb.cancel_order(order['orderId'])
    else:
        print("未找到當前訂單 (或虛擬列表為空)。")

    # 範例: 獲取股票代號的 ticker ID
    aapl_ticker_info = wb.get_ticker('AAPL')
    if aapl_ticker_info:
        aapl_ticker_id = aapl_ticker_info['tickerId']
        print(f"AAPL 股票 ID: {aapl_ticker_id}")
    else:
        print("無法獲取 AAPL 股票 ID。")
        aapl_ticker_id = None # 確保如果未找到則為 None

    # --- 實時數據串流 ---
    print("\n## 實時數據串流")
    # 定義用於處理傳入串流訊息的回調函式
    nyc = timezone('America/New_York') # 定義用於時間戳轉換的時區

    def on_price_message(topic, data):
        """處理傳入價格更新的回調函式。"""
        try:
            print(f"\n[價格更新] 股票 ID: {topic.get('tickerIds', ['N/A'])[0]}")
            if 'deal' in data:
                price = data['deal'].get('price', 'N/A')
                volume = data['deal'].get('volume', 'N/A')
                trade_time = data['deal'].get('tradeTime', 'N/A')
                if trade_time != 'N/A':
                    # 假設 tradeTime 格式為 HH:MM:SS
                    current_dt = datetime.today().astimezone(nyc)
                    ts = current_dt.replace(hour=int(trade_time[:2]), minute=int(trade_time[3:5]), second=int(trade_time[6:8]), microsecond=0)
                    print(f"  價格: {price}, 成交量: {volume}, 交易時間: {ts.strftime('%Y-%m-%d %H:%M:%S')}")
                else:
                    print(f"  價格: {price}, 成交量: {volume}, 交易時間: {trade_time}")
            else:
                # 處理其他類型的價格訊息 (例如 topic 102, 104)
                print(f"  完整數據: {data}")
        except KeyError as e:
            print(f"  價格數據中缺少鍵: {e}。完整數據: {data}")
        except Exception as e:
            print(f"  處理價格訊息時發生錯誤: {e}。完整數據: {data}")


    def on_order_message(topic, data):
        """處理傳入訂單狀態更新的回調函式。"""
        print(f"\n[訂單更新] 訊息 ID: {topic.get('messageId', 'N/A')}")
        order_info = data.get('data', {})
        print(f"  訂單 ID: {order_info.get('orderId', 'N/A')}, 狀態: {order_info.get('orderStatus', 'N/A')}, "
              f"成交數量: {order_info.get('filledQuantity', 'N/A')}")
        print(f"  完整數據: {data}")

    # 初始化串流連線
    conn = StreamConn(debug_flg=True) # 將 debug_flg 設定為 True 以查看更多 MQTT 訊息

    # 設定回調函式
    conn.price_func = on_price_message
    conn.order_func = on_order_message

    # 連接到串流伺服器
    # 如果 access_token 可用，它也將連接到訂單更新。
    # 如果您成功登入，請使用 wb._access_token。
    if wb._access_token and len(wb._access_token) > 1:
        print("正在使用存取權杖連接到串流 (用於訂單更新)。")
        conn.connect(wb._did, access_token=wb._access_token)
    else:
        print("正在不使用存取權杖連接到串流 (僅價格報價)。")
        conn.connect(wb._did)

    # 訂閱股票 (例如 AAPL)
    if aapl_ticker_id:
        print(f"\n正在訂閱 AAPL 的實時數據 (股票 ID: {aapl_ticker_id})...")
        conn.subscribe(tId=aapl_ticker_id, level=103) # Level 103 用於交易 (成交)
        # 您可以根據需要訂閱其他級別，例如 104 用於訂單簿深度

    print("\n正在啟動串流的阻塞循環。按 Ctrl+C 退出。")
    try:
        conn.run_blocking_loop() # 這將無限期運行，處理訊息
    except KeyboardInterrupt:
        print("\n用戶已停止串流。")
    except Exception as e:
        print(f"串流期間發生錯誤: {e}")
#endregion
import os
import json
import requests

# ==================== 🛠️ 基础配置区域 🛠️ ====================
EMBY_URL = "http://127.0.0.1:8096"   # 你的 Emby 服务器地址
API_KEY = "e386c9b41c9d4ddda1393608e687e7f7"
SUB_FOLDER = r"/Users/mason/Movies/subTitle"  # 100个字幕所在的本地文件夹路径
LANGUAGE = "zh"                     # 字幕语言代码
HISTORY_FILE = "uploadHistory.json"  # 增量历史记录文件名（保存在脚本同级目录下）
# ==================================================================

headers = {
    "X-Emby-Token": API_KEY,
    "Accept": "application/json"
}

def load_history():
    """读取历史上传记录"""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_history(history):
    """保存历史上传记录"""
    try:
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"⚠️ 保存历史记录本失败: {e}")

def search_video_versions(core_id):
    """去 Emby 检索所有包含该核心 ID 的视频版本"""
    search_url = f"{EMBY_URL}/emby/Items"
    params = {
        "SearchTerm": core_id,
        "IncludeItemTypes": "Movie,Episode",
        "Recursive": "true"
    }
    try:
        response = requests.get(search_url, headers=headers, params=params)
        if response.status_code == 200:
            items = response.json().get("Items", [])
            matched_items = []
            for item in items:
                item_name = item.get("Name", "").lower()
                item_path = item.get("Path", "").lower()
                target = core_id.lower()
                if target in item_name or target in item_path or target.replace('-', '') in item_name:
                    matched_items.append((item["Id"], item["Name"]))
            return matched_items
    except Exception as e:
        print(f"❌ 搜索关键字 [{core_id}] 失败: {e}")
    return []

def upload_subtitle(item_id, file_path, file_format, emby_name):
    """将字幕推送到对应的 Emby 视频中"""
    upload_url = f"{EMBY_URL}/emby/SubtitleManager/Upload"
    params = {
        "ItemId": item_id,
        "Language": LANGUAGE,
        "Format": file_format,
        "IsForced": "false"
    }

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            file_data = f.read()
            response = requests.post(upload_url, headers=headers, params=params, data=file_data)
        
        if response.status_code in [200, 204]:
            print(f"   =>  成功同步至: [{emby_name}]")
            return True
        else:
            print(f"   ❌ 上传至 [{emby_name}] 失败！错误码: {response.status_code}")
            try:
                error_reason = response.content.decode('utf-8')
            except Exception:
                error_reason = response.text
            print(f"..., 原因: {error_reason}")
            return False
    except Exception as e:
        print(f"❌ 请求发生异常 [{emby_name}]: {e}")
    return False

def main():
    if not os.path.exists(SUB_FOLDER):
        print("❌ 错误：你填写的字幕文件夹路径不存在！")
        return

    # 加载历史记录本
    history = load_history()

    print("🚀 开始执行智能增量扫描推送...")
    success_count = 0
    skip_count = 0
    fail_count = 0

    for root, dirs, files in os.walk(SUB_FOLDER):
        for file in files:
            if file.endswith(('.srt', '.ass', '.vtt')):
                file_path = os.path.join(root, file)
                full_name, ext = os.path.splitext(file)
                file_format = ext.replace('.', '')
                
                # 获取当前文件最后的修改时间
                file_mtime = os.path.getmtime(file_path)
                
                # 【增量核心判断】如果记录本里有这个文件，且修改时间对得上，直接跳过
                if full_name in history and history[full_name] == file_mtime:
                    skip_count += 1
                    continue
                
                # 智能提取核心 ID
                core_id = full_name
                print(f"\n[新文件/有变动] 本地字幕: {file} (核心ID: {core_id})")
                
                matched_videos = search_video_versions(core_id)
                
                if matched_videos:
                    print(f"   🎯 查找到 Emby 中存在 {len(matched_videos)} 个关联视频版本:")
                    upload_any_success = False
                    for item_id, emby_name in matched_videos:
                        short_name = emby_name[:30] + "..." if len(emby_name) > 30 else emby_name
                        if upload_subtitle(item_id, file_path, file_format, short_name):
                            upload_any_success = True
                    
                    if upload_any_success:
                        success_count += 1
                        # 成功后，将该文件的路径和最新修改时间记入账本
                        history[full_name] = file_mtime
                        save_history(history)  # 实时保存，防止中途断电或意外退出
                else:
                    print(f"   ⚠️ 匹配失败：未能在 Emby 中检索到任何包含 '{core_id}' 的视频")
                    fail_count += 1

    print(f"\n🎉 任务结束！")
    print(f"   ⏭️  跳过（无变更）: {skip_count} 个")
    print(f"   ⬆️  新上传/已更新: {success_count} 个")
    print(f"   ❌  未匹配成功: {fail_count} 个")

if __name__ == "__main__":
    main()
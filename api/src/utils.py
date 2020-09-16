def make_response(data, status, total=None, has_more=False):
    return {"data": data, "has_more": has_more}, status

def make_response(data, status=200, total=None, has_more=False):
    return {"data": data, "has_more": has_more}, status
